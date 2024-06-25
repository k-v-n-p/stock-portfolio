// src/App.tsx
import React, { useState, useEffect } from 'react';
import { RootState } from '../../store/store';
import { connect} from 'react-redux';
import { SymbolsType, StockData, useGetStockSymbolsQuery, useLazyGetStockDataQuery } from '../../apis/stockApi';
import { 
  Grid, 
  Row, 
  Col, 
  Panel, 
  Loader, 
  CustomProvider, 
  Toggle, 
  Container, 
  Header, 
  Content, 
  Navbar,
  Stack,
  Popover,
  Whisper  
} from 'rsuite';
import styles from './Dashboard.module.scss';
import StocksBoard from '../StocksBoard/index';
import { setSymbols } from '../../store/slices/symbolSlice';
import {setStockData, clearStockData} from '../../store/slices/stockDataSlice';
import SelectedStocksBoard from '../SelectedStocksBoard/index';
import AnimatedNumbers from "react-animated-numbers";
import {EvalDiveristyScore, getIndividualSectorWeightage} from '../../utils/diversityCalculator';
import { PieChart } from '@rsuite/charts'; 
import InfoOutlineIcon from '@rsuite/icons/InfoOutline';

const Dashboard: React.FC<PropsFromRedux> = ({symbols, selectedSymbols, setSymbols, stockData, clearStockData, setStockData}) => {
  const { data: stockSymbolsData, error: stockSymbolsError, isFetching: isFetchingstockSymbols} = useGetStockSymbolsQuery<{data:string[], error:any, isFetching:boolean}>( undefined, { skip: !!symbols.length} );
  const [triggerStocksData,{ data: stocksData, error: stocksError, isFetching: isFetchingStocks}] = useLazyGetStockDataQuery<{data:StockData, error:any, isFetching:boolean}>();
  const [theme, setTheme] = useState<"light" | "dark" | "high-contrast" | undefined>('light');
  const [diversityScore, setDiversityScore] = useState<number>(0);
  const [pieChartData, setPieChartData] = useState([]); // [["sector",percentage]
  const [laodingMessage, setLoadingMessage] = useState<string>('');
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  useEffect(()=>{

    if (!!stockSymbolsData && !isFetchingstockSymbols) {
      setSymbols([...stockSymbolsData.slice(0,5)]);
      setLoadingMessage("Fetching more stocks...")
      setTimeout(() => {
        setSymbols([...stockSymbolsData.slice(5,10)]);
      }, 1000);
    }
  },[isFetchingstockSymbols, stockSymbolsData,setSymbols])

  useEffect(() => {
    const filteredSymbols = symbols.filter(symbol => !stockData[symbol]);
    if (filteredSymbols.length > 0) {
      triggerStocksData(filteredSymbols,true);
    } else {
      clearStockData();
    }
  }, [symbols, triggerStocksData, clearStockData]);

  useEffect(() => {
    if (stocksData) {
      setStockData({...stockData,...stocksData});
    }
  }, [stocksData]);
  const roundOff = (value: number, decimals: number = 2): number => Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  useEffect(() => {
    let sectorObject={}
    selectedSymbols.map((symbol) => {
      if (stockData[symbol] && stockData[symbol].sector){
        if (stockData[symbol].sector in sectorObject) {
          sectorObject[stockData[symbol].sector].push(roundOff(stockData[symbol].currentPrice))
        }
        else{
          sectorObject[stockData[symbol].sector]=[roundOff(stockData[symbol].currentPrice)]
        }
      }
      return null
    })
    setDiversityScore( roundOff(EvalDiveristyScore(sectorObject),1) )
    setPieChartData(getIndividualSectorWeightage(sectorObject));
    console.log(pieChartData)
  }, [selectedSymbols, stockData])

 if (stockSymbolsError || stocksError){
    return <>error fetching data</>
  }
  // const circumference = 2 * Math.PI * 50; // Assuming a radius of 50 (adjust as needed)
  // const offset = circumference - (diversityScore / 100) * circumference;
  // console.log(stocksData)
    return (
      <CustomProvider theme={theme}>
      {isFetchingstockSymbols || isFetchingStocks ? <Loader center size="lg" content={laodingMessage} vertical />
      :
      <Container>
        <Header>
          <Navbar>
            <Navbar.Brand className={styles.brand}>
              Stock Portfolio Dashboard
            </Navbar.Brand>
            <Stack direction="row-reverse" alignItems='center' spacing={6} style={{height:'50px'}}>
              Dark<Toggle style={{paddingLeft:'5px'}} onClick={toggleTheme}/>Light
            </Stack>
          </Navbar>
        </Header>
        <Content>
        <Grid fluid className={styles.dashboardContent}>
          <Row className={styles.dashboardRow}>
            <Col xs={18}  className={styles.dashboardCol}>
              <Panel bordered  style={{minHeight:"400px"}}>
                <SelectedStocksBoard />
              </Panel>
            </Col>
            <Col xs={6}  className={styles.dashboardCol}>
              <Panel bordered style={{minHeight:"400px"}}>
                <h2>Stock Portfolio Diversity</h2>
                <Whisper
                  trigger="hover"
                  placement="autoVertical"   //"bottom"
                  controlId={`diversity-pie-chart`}
                  speaker={
                    diversityScore===0 ? (
                      <Popover>
                        <div>
                          <Loader content="Choose more stocks to continue..." />
                        </div>
                      </Popover>
                    ) : (
                      <Popover style={{width:'500px'}}>
                          <PieChart name="PieChart" data={pieChartData} /> 
                      </Popover>
                    )
                  }
                >
                  <div className={styles.divScoreContainer} data-val={diversityScore}>

                    
                    <AnimatedNumbers
                      includeComma
                      className={styles.diversityScore}
                      transitions={(index) => ({
                        type: "spring",
                        duration: index + 0.3,
                      })}
                      animateToNumber={diversityScore}
                      fontStyle={{
                        fontSize: 80,
                      }}
                    />
                  </div>
                </Whisper>
              </Panel>
              <span style={{justifyContent:"center", fontSize:"1.5em" }}><InfoOutlineIcon /> Hover on the score to see diversity chart.</span>
            </Col>
          </Row>
          <Row className={styles.dashboardRow}>
            <Col xs={24}>
              <Panel bordered>
                <StocksBoard />
              </Panel>
            </Col>
          </Row>
        </Grid>
        </Content>
        {/* <Footer>Footer</Footer> */}
      </Container>
      }
      </CustomProvider>
    );
  };
  
  const mapStateToProps = (state: RootState) => ({
    symbols: state.symbol.symbols,
    stockData: state.stockData.data,
    selectedSymbols:  state.symbol.selectedSymbols
  });

  const mapDispathToProps = (dispatch) => {
    return {
      setSymbols: (payload:string[]) => dispatch(setSymbols(payload)),
      setStockData: (payload:StockData) => dispatch(setStockData(payload)),
      clearStockData: () => dispatch(clearStockData())
    }
  };
  
  const connector = connect(mapStateToProps, mapDispathToProps);
  
  type StateProps = {
    symbols: SymbolsType,
    stockData: StockData,
    selectedSymbols: string[]
  }
  type DispathProps = {
    setSymbols: (payload:SymbolsType) => void,
    setStockData: (payload:StockData) => void,
    clearStockData: () => void
  }

  type PropsFromRedux = StateProps & DispathProps;
  
  export default connector(Dashboard);

  {/* <svg className="progress-ring" width="120" height="120">
                  <circle
                    className="progress-ring-circle"
                    stroke="#0099ff"
                    strokeWidth="8"
                    fill="transparent"
                    r="50"
                    cx="60"
                    cy="60"
                  />
                  <circle
                    className="progress-ring-circle"
                    stroke="#f0f0f0"
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset="0"
                    fill="transparent"
                    r="50"
                    cx="60"
                    cy="60"
                  />
                  <circle
                    className="progress-ring-circle"
                    stroke="#0099ff"
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    fill="transparent"
                    r="50"
                    cx="60"
                    cy="60"
                  />
                </svg> */}