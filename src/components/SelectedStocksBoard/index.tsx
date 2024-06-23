import React, {useRef} from 'react';
import { RootState } from '../../store/store';
import { connect} from 'react-redux';
import { StockData } from '../../apis/stockApi';
import { Grid, Row, Col, Panel, Button, Badge  } from 'rsuite';
import styles from './SelectedStocks.module.scss';
import { addSelectedSymbol, removeSelectedSymbol } from '../../store/slices/symbolSlice';
import CloseOutlineIcon from '@rsuite/icons/CloseOutline';

type StockCardProps = PropsFromRedux 

const SeletedStocksBoard: React.FC<StockCardProps> = ({ stockData, selectedSymbols, addSelectedSymbol, removeSelectedSymbol }) => {
  
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
      <h4>My Stocks</h4>
      <Grid fluid>
        <Row>
          {/* {symbols.length > cardsPerPage && (} */}
            <>
           
              <button className={styles.scrollButtonLeft} onClick={scrollLeft}>
                &lt;
              </button>
              <div className={styles.scrollContainer} ref={scrollContainerRef}>
                {selectedSymbols.map((symbol, index) => (
                  <Col key={index} xs={12} md={6} lg={3}>
                      <Panel className={styles.stockCard}>
                      <div className={styles.closeButton} onClick={()=>handleDeselectSymbol(symbol)}>
                        <CloseOutlineIcon color="red" />
                      </div>
                        <img src={stockData[symbol].logo} alt="logo" className={styles.logo} />
                        <h4>{stockData[symbol].name}</h4>
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

export default connector(SeletedStocksBoard);
