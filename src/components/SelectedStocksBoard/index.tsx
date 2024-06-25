import React, {useRef} from 'react';
import { RootState } from '../../store/store';
import { connect} from 'react-redux';
import { StockData } from '../../apis/stockApi';
import { Grid, Row, Col, Panel, Tooltip, Whisper} from 'rsuite';
import styles from './SelectedStocks.module.scss';
import { addSelectedSymbol, removeSelectedSymbol } from '../../store/slices/symbolSlice';
import CloseOutlineIcon from '@rsuite/icons/CloseOutline';

type StockCardProps = PropsFromRedux 

const SeletedStocksBoard: React.FC<StockCardProps> = ({ stockData, selectedSymbols, addSelectedSymbol, removeSelectedSymbol }) => {
  
  const cardsPerPage = 4; 
  const symbols = Object.keys(stockData)
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

  const handleDeselectSymbol = (symbol) => {
    if (selectedSymbols.includes(symbol)) {
      removeSelectedSymbol(symbol);
    }
  };

  return (
    <>
      <h4>My Stocks</h4>
      <Grid fluid>
        <Row gutter={16}>
            <>
              <div className={styles.scrollContainer} ref={scrollContainerRef}>
                {selectedSymbols.map((symbol, index) => (
                  <>
                  <Col key={index} xs={18} md={16} lg={14}>
                      <Panel className={styles.stockCard}>
                      <div className={styles.closeButton} onClick={()=>handleDeselectSymbol(symbol)}>
                        <Whisper
                          trigger="hover"
                          speaker={<Tooltip>Remove this stock</Tooltip>}
                        >
                            <CloseOutlineIcon color="#f44336" style={{fontSize:"1.6em"}}/>
                        </Whisper>
                      </div>
                        <img src={stockData[symbol].logo} alt="logo" className={styles.logo} />
                        <h4>{stockData[symbol].name}</h4>
                        <p className={styles.sector}>{stockData[symbol].sector}</p>
                        <p className={styles.price}>{stockData[symbol].currentPrice.toFixed(2)}$</p>
                      </Panel>
                  </Col>
                  <Col key={`${index}-2`} xs={6} md={8} lg={10}></Col></>
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
            </>
        </Row>
      </Grid>
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  stockData: state.stockData.data,
  selectedSymbols: state.symbol.selectedSymbols,
});

const mapDispathToProps = (dispatch) => {
  return {
    addSelectedSymbol: (symbol:string) => dispatch(addSelectedSymbol(symbol)),
    removeSelectedSymbol: (symbol:string) => dispatch(removeSelectedSymbol(symbol)),
  }
};

const connector = connect(mapStateToProps, mapDispathToProps);
type StateProps = {
  stockData: StockData,
  selectedSymbols: string[],
}
type DispathProps = {
  addSelectedSymbol: (symbol: string) => void,
  removeSelectedSymbol: (symbol: string) => void,
}

type PropsFromRedux = StateProps & DispathProps;

export default connector(SeletedStocksBoard);
