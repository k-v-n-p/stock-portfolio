// src/App.tsx
import React, { useState, useEffect,useRef  } from 'react';
import { RootState } from '../../store/store';
import { connect, ConnectedProps } from 'react-redux';
import { SymbolsType, stockPrice, stockInfo, symbolData, useGetStockSymbolsQuery, useLazySubscribeToStockQuery, useLazyGetStockProfileQuery } from '../../apis/stockApi';
import { Grid, Row, Col, Panel, FlexboxGrid, Stack, Carousel } from 'rsuite';
import styles from './Dashboard.module.scss';
import StockCard from '../StockCard';
import { useSelector } from 'react-redux';
import { skipToken } from '@reduxjs/toolkit/query/react'
import { addSymbol, removeSymbol, clearSymbols, setSymbols } from '../../store/slices/symbolSlice';


const Dashboard: React.FC<PropsFromRedux> = ({symbols,setSymbols}) => {
  const { data: stockSymbolsData, error: stockSymbolsError, isFetching: isFetchingstockSymbols} = useGetStockSymbolsQuery<{data:string[], error:any, isFetching:boolean}>( undefined, { skip: !!symbols.length} );

  useEffect(()=>{
    if(!!stockSymbolsData && !isFetchingstockSymbols){
      setSymbols(stockSymbolsData.slice(0,10))
    }
  },[isFetchingstockSymbols, stockSymbolsData,setSymbols])
  
  useEffect(()=>{
    console.log("data",stockSymbolsData)
    console.log("symbols",symbols)
  },[])
  const cardsPerPage = 4; // Number of cards to display per page
  const totalCards = symbols.length;
  const totalPages = Math.ceil(totalCards / cardsPerPage);
  const scrollContainerRef = useRef(null);
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft -= scrollContainerRef.current.offsetWidth;
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft += scrollContainerRef.current.offsetWidth;
    }
  };

    return (
      <>
        <Grid fluid className={styles.dashboardContent}>
          <Row className={styles.dashboardRow}>
            <Col xs={12}  className={styles.dashboardCol}>
              <Panel bordered style={{height:"200px", border:"2px solid red"}}>
                <h4>Selected Stocks</h4>
                <Grid fluid>
                  <Row>
                    <Col xs={12} md={12}>
                      <Panel bordered>Selected Stock card</Panel>
                    </Col>
                    <Col xs={12} md={12}>
                      <Panel bordered>Selected Stock card 2</Panel>
                    </Col>
                  </Row>
                </Grid>
              </Panel>
            </Col>
            <Col xs={12}  className={styles.dashboardCol}>
              <Panel bordered style={{height:"200px", border:"2px solid red"}}>
                <h4>Stock Portfolio Diversity</h4>
                <div >
                  ?
                </div>
                <div style={{ textAlign: 'center' }}>
                  (Insert score from formula here)
                </div>
              </Panel>
            </Col>
          </Row>
          <Row className={styles.dashboardRow}>
            <Col xs={24}>
              <Panel bordered>
                <h4>All Stocks</h4>
                <Grid fluid>
                  <Row>

                    <div className={styles.scrollContainer} ref={scrollContainerRef}>
                      {symbols.map(symbol => (
                        <Col key={symbol} xs={24 / cardsPerPage} className={styles.cardCol}>
                          <StockCard symbol={symbol} />
                        </Col>
                      ))}
                    </div>
                    {symbols.length > cardsPerPage && (
                      <>
                        <button className={styles.scrollButtonLeft} onClick={scrollLeft}>
                          &lt;
                        </button>
                        <button className={styles.scrollButtonRight} onClick={scrollRight}>
                          &gt;
                        </button>
                      </>
                    )}
                    <Col xs={24} sm={12} md={6}>
                      <Panel bordered>Stock 2 (Data)</Panel>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Panel bordered>Stock 3 (Data)</Panel>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Panel bordered>Stock 4 (Data)</Panel>
                    </Col>
                  </Row>
                </Grid>
              </Panel>
            </Col>
          </Row>
        </Grid>
      </>
    );
  };
  
  const mapStateToProps = (state: RootState) => ({
    symbols: state.symbol.symbols,
  });

  const mapDispathToProps = (dispatch) => {
    return {
    setSymbols: (payload) => dispatch(setSymbols(payload))
    }
  };
  
  const connector = connect(mapStateToProps, mapDispathToProps);
  
  type StateProps = {
    symbols: SymbolsType,
  }
  type DispathProps = {
    setSymbols: (payload:SymbolsType) => void,
  }

  type PropsFromRedux = StateProps & DispathProps;
  
  export default connector(Dashboard);