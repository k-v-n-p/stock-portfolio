// src/App.tsx
import React, { useState, useEffect,useRef  } from 'react';
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
  Footer, 
  Navbar,
  Stack  
} from 'rsuite';
import styles from './Dashboard.module.scss';
import StocksBoard from '../StocksBoard/index';
import { setSymbols } from '../../store/slices/symbolSlice';
import {setStockData, clearStockData} from '../../store/slices/stockDataSlice';
import SelectedStocksBoard from '../SelectedStocksBoard/index';
import AnimatedNumbers from "react-animated-numbers";
import {EvalDiveristyScore} from '../../utils/diversityCalculator';

const Dashboard: React.FC<PropsFromRedux> = ({symbols, selectedSymbols, setSymbols, stockData, clearStockData, setStockData}) => {
  const { data: stockSymbolsData, error: stockSymbolsError, isFetching: isFetchingstockSymbols} = useGetStockSymbolsQuery<{data:string[], error:any, isFetching:boolean}>( undefined, { skip: !!symbols.length} );
  const [triggerStocksData,{ data: stocksData, error: stocksError, isFetching: isFetchingStocks}] = useLazyGetStockDataQuery<{data:StockData, error:any, isFetching:boolean}>();
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark" | "high-contrast" | undefined>('light');
  const [diversityScore, setDiversityScore] = useState<number>(0);
  const Recall_api_time = 2000;

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  useEffect(()=>{
    if(!!stockSymbolsData && !isFetchingstockSymbols){
      console.log("Fetched stockSymbolsData", stockSymbolsData)
      setSymbols([...stockSymbolsData.slice(0,5)])
    }
  },[isFetchingstockSymbols, stockSymbolsData,setSymbols])

  useEffect(() => {
    if (symbols.length > 0) {
      triggerStocksData(symbols,true);
    } else {
      clearStockData();
    }
  }, [symbols, triggerStocksData]);

  useEffect(() => {
    if (stocksData) {
      console.log("friend", stocksData, stockData)
      setStockData({...stockData,...stocksData});
      setLoading(false);
    }
  }, [stocksData]);
  const roundOff=(value:number, decimals:number=2) => Math.round(value * 100) / 100
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
    })
    setDiversityScore( roundOff(EvalDiveristyScore(sectorObject)) )
  }, [selectedSymbols])

  const handleThemeToggle = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  }

  const circumference = 2 * Math.PI * 50; // Assuming a radius of 50 (adjust as needed)
  const offset = circumference - (diversityScore / 100) * circumference;

    return (
      <CustomProvider theme={theme}>
      {isFetchingstockSymbols ? <Loader center size="lg" content="Fetching Random Stocks" vertical />
      :
      <Container>
        <Header>
          <Navbar>
            <Navbar.Brand >
            </Navbar.Brand>
            <Stack direction="row-reverse" alignItems='center' spacing={6} style={{height:'50px'}}>
              Dark<Toggle style={{paddingLeft:'5px'}} onClick={handleThemeToggle}/>Light
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
                <div style={{ textAlign: 'center' }}>
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
                  <AnimatedNumbers
                    includeComma
                    className={styles.diversityScore}
                    transitions={(index) => ({
                      type: "spring",
                      duration: index + 0.3,
                    })}
                    animateToNumber={diversityScore}
                  />
                </div>
              </Panel>
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