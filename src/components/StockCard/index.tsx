import React from 'react';


interface StockCardProps {
  symbol: string;
}

const StockCard: React.FC<StockCardProps> = ({ symbol }) => {
  return (
    <div className="stock-card">
      <h3>{symbol}</h3>
      {/* <p>Price: ${price.toFixed(2)}</p>
      <p>Sector: {sector}</p> */}
    </div>
  );
};

export default StockCard;
