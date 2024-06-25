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
  Whisper,
  useToaster,
  Button, 
  Tooltip,
  Message
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
  const [loadingMessage, setLoadingMessage] = useState<string>('Getting Random initial Stocks');
  const [fetchingStocksAgain, setFetchingStocksAgain] = useState<boolean>(false);
  const toaster = useToaster();
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };
  // let currentValue=0;
  const handleFetchStocksAgain =() =>{

    const currStocksCount:number=Object.keys(stockData).length;

    setFetchingStocksAgain(true);
    toaster.push(<Message>Fetching more stocks...</Message>, {
      duration: 3000,
      placement: "bottomCenter"
    });
    console.log("current fethched stocks", stockSymbolsData)
    if (!!stockData && currStocksCount<300) {
      fetchingRandomUnfetchedStocks()
    }
    else if (currStocksCount>=300) {
      toaster.push(<Message type="warning">That's enough stocks for you buddy!</Message>, {
        duration: 5000,
        placement: "bottomCenter"
      });
      toaster.push(<Message type="warning">You have almost 300 stocks!!</Message>, {
        duration: 5000,
        placement: "bottomCenter"
      });
    }
    setTimeout(() => {
      setFetchingStocksAgain(false);
    }, 3000);
  }

  useEffect(()=>{
    if (!!stockSymbolsData && !isFetchingstockSymbols) {
      setSymbols([...stockSymbolsData]);
    }
  },[isFetchingstockSymbols, stockSymbolsData,setSymbols])

  const fetchingRandomUnfetchedStocks = () => {
    const filteredSymbols = symbols.filter(symbol => !stockData[symbol]).slice(0,5);
    if (filteredSymbols.length > 0) {
      triggerStocksData(filteredSymbols,true);
    } else {
      clearStockData();
    }
  }

  useEffect(() => {
    if (!!symbols.length) {
      const filteredSymbols = symbols.filter(symbol => !stockData[symbol]).slice(0,5);
        if (filteredSymbols.length > 0) {
          triggerStocksData(filteredSymbols,true);
        } else {
          clearStockData();
        }
    } 
  }, [symbols, triggerStocksData, clearStockData]);

  useEffect(() => {
    if (stocksData) {
      toaster.clear()
      setStockData({...stocksData, ...stockData,});
      setTimeout(() => {
        toaster.push(<Message type="success">Succesfully fetched stocks!</Message>, {
          duration: 2000,
          placement: "bottomCenter"
        });
      }, 500);
      setFetchingStocksAgain(false);
      
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
  }, [selectedSymbols, stockData])

 if (stockSymbolsError || stocksError){
    return <>error fetching data</>
  }
  // const circumference = 2 * Math.PI * 50; // Assuming a radius of 50 (adjust as needed)
  // const offset = circumference - (diversityScore / 100) * circumference;
  // console.log(stocksData)
    return (
      <CustomProvider theme={theme}>
      {isFetchingstockSymbols || isFetchingStocks ? <Loader center size="lg" content={loadingMessage} vertical />
      :
      <Container className={styles.mainContainer}>
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
                  trigger={"click"}
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
                          <PieChart name="Diversity Percentage" data={pieChartData} /> 
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
              <span style={{justifyContent:"center", textAlign:"center", fontSize:"1em", position:'relative', bottom: 0 }}><InfoOutlineIcon /> Click on the score to see diversity chart.</span>
              
            </Col>
          </Row>
          <Row className={styles.dashboardRow}>
            <Col xs={24}>
              <Whisper
                  trigger="hover"
                  speaker={<Tooltip>Click to add more stocks to browse from</Tooltip>}
                >
                <Button appearance="ghost" color="cyan" size="xs" disabled={fetchingStocksAgain} onClick={handleFetchStocksAgain} style={{marginLeft:"10px", marginBottom:"10px"}}>Fetch more stocks</Button>
              </Whisper>
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