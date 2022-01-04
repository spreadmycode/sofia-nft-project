import React from 'react';

const NftCard = ({image, name, score, pos, detail, handleShowDetail}: any) => {
  
  return <div className="col-span-1 border border-gray-800 rounded-lg overflow-hidden theme-bg-color">
    <div className="w-full h-full flex flex-col justify-center items-center space-y-2 pb-2">
      <div className="w-full relative">
        <button onClick={() => handleShowDetail(detail)}><img src={image} width="100%" /></button>
      </div>
      <p className="text-center text-gray-400">{name}</p>
      <div className="w-full flex flex-row">
        <div className="flex flex-col w-1/2">
          <p className="text-center text-gray-600">RANK</p>
          <p className="text-center text-gray-400">{pos}</p>
        </div>
        <div className="w-px bg-gray-600"></div>
        <div className="flex flex-col w-1/2">
          <p className="text-center text-gray-600">SCORE</p>
          <p className="text-center text-gray-400">{score}</p>
        </div>
      </div>
    </div>
  </div>;
}

export default NftCard;