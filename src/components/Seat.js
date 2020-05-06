import React from 'react';
import styled from 'styled-components';
import Tippy from '@tippy.js/react';
import VisuallyHidden from '@reach/visually-hidden';
import { Icon } from 'react-icons-kit';
import { checkCircle } from 'react-icons-kit/feather/checkCircle';

import seatImageSrc from '../assets/seat-available.svg';
import { getRowName, getSeatNum, encodeSeatId } from '../../__solution/src/helpers';

import UnstyledButton from '../../__solution/src/components/UnstyledButton';
import { BookingContext } from '../../__solution/src/components/BookingContext';

const Seat = ({ rowIndex, seatIndex, width, height, price, status }) => {
  const {
    actions: { beginBookingProcess },
  } = React.useContext(BookingContext);

  const rowName = getRowName(rowIndex);
  const seatNum = getSeatNum(seatIndex);

  const seatId = encodeSeatId(rowIndex, seatIndex);

  return (
    <Tippy content={`Row ${rowName}, Seat ${seatNum} – $${price}`}>
      <Wrapper
        disabled={status === 'unavailable'}
        onClick={() => {
          beginBookingProcess({ seatId, price });
        }}
      >
        <VisuallyHidden>
          Seat number {seatNum} in Row {rowName}
        </VisuallyHidden>
        <img src={seatImageSrc} alt="" style={{ width, height }} />
        {seatIndex === 3 && rowIndex === 1 && (
          <IconWrapper>
            <Icon icon={checkCircle} />
          </IconWrapper>
        )}
      </Wrapper>
    </Tippy>
  );
};

const Wrapper = styled(UnstyledButton)`
  position: relative;

  &:disabled img {
    filter: grayscale(100%);
  }
`;

const IconWrapper = styled.div`
  position: absolute;
  bottom: 0;
  right: -5px;
  padding: 3px;
  background: white;
  border-radius: 100%;
  color: #009961;

  & svg,
  & i {
    display: block !important;
  }
`;

export default Seat;
