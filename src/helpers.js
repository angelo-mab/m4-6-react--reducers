export const getRowName = rowIndex => {
  return String.fromCharCode(65 + rowIndex);
};

export const getRowIndex = rowName => {
  return rowName.charCodeAt(0) - 65;
};

export const getSeatNum = seatIndex => seatIndex + 1;
export const getSeatIndex = seatNum => seatNum - 1;

export const encodeSeatId = (rowIndex, seatIndex) => {
  const rowName = getRowName(rowIndex);
  const seatNum = getSeatNum(seatIndex);

  return `${rowName}-${seatNum}`;
};

export const decodeSeatId = seatId => {
  if (!seatId) {
    return {};
  }

  const [rowName, seatNum] = seatId.split('-');

  return {
    rowName,
    seatNum,
    rowIndex: getRowIndex(rowName),
    seatIndex: seatNum - 1,
  };
};
