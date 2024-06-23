import React, {useRef} from 'react';
import { RootState } from '../../store/store';
import { connect} from 'react-redux';
import { StockData } from '../../apis/stockApi';
import { Grid, Row, Col, Panel, Button } from 'rsuite';
import styles from './StocksBoard.module.scss';
import { addSelectedSymbol, removeSelectedSymbol } from '../../store/slices/symbolSlice';

type StockCardProps = PropsFromRedux 

const StocksBoard: React.FC<StockCardProps> = ({ stockData, selectedSymbols, addSelectedSymbol, removeSelectedSymbol }) => {
  
  const cardsPerPage = 4; // Number of cards to display per page
  const symbols = Object.keys(stockData)
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

  const handleAddSymbol = (symbol) => {
    if (!selectedSymbols.includes(symbol)) {
      addSelectedSymbol(symbol);
    }
  };
  const handleDeselectSymbol = (symbol) => {
    if (selectedSymbols.includes(symbol)) {
      removeSelectedSymbol(symbol);
    }
  };

  console.log(stockData)
  return (
    <>
      <h4>All Stocks</h4>
      <Grid fluid>
        <Row>
          {/* {symbols.length > cardsPerPage && (} */}
            <>
              <button className={styles.scrollButtonLeft} onClick={scrollLeft}>
                &lt;
              </button>
              <div className={styles.scrollContainer} ref={scrollContainerRef}>
                {symbols.map((symbol, index) => (
                  <Col key={index} xs={12} md={6} lg={3}>
                    <Panel header={stockData[symbol].name} className={styles.stockCard}>
                      <img src={stockData[symbol].logo} alt="logo" className={styles.logo} />
                      <p>{stockData[symbol].sector}</p>
                      <p className={styles.price}>{stockData[symbol].currentPrice.toFixed(2)}$</p>
                      <Button 
                        appearance={selectedSymbols.includes(symbol)?"ghost":"primary"}
                        color={selectedSymbols.includes(symbol)?"orange":"violet"}
                        className={styles.addButton} 
                        onClick={() => selectedSymbols.includes(symbol)?handleDeselectSymbol(symbol):handleAddSymbol(symbol)}
                      >
                        {selectedSymbols.includes(symbol)?'Remove':'Select'}
                      </Button>
                    </Panel>
                  </Col>
                ))}
                </div>
              <button className={styles.scrollButtonRight} onClick={scrollRight}>
                &gt;
              </button>
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

export default connector(StocksBoard);
