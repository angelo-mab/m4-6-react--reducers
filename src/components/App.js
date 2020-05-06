import React from 'react';
import styled from 'styled-components';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';

import GlobalStyles from './GlobalStyles';
import TicketWidget from './TicketWidget';
import PurchaseModal from './PurchaseModal';
import { SeatContext } from './SeatContext';
import { BookingContext } from './BookingContext';

function App() {
  const {
    actions: { receiveSeatInfoFromServer },
  } = React.useContext(SeatContext);

  const {
    actions: { clearSnackbar },
    status,
  } = React.useContext(BookingContext);

  React.useEffect(() => {
    fetch('api/seat-availability')
      .then(res => res.json())
      .then(receiveSeatInfoFromServer);
  }, [receiveSeatInfoFromServer]);

  return (
    <>
      <GlobalStyles />

      <Centered>
        <TicketWidget />
      </Centered>

      <PurchaseModal />
      <Snackbar open={status === 'purchased'} severity="success">
        <Alert
          severity="success"
          onClose={clearSnackbar}
          elevation={6}
          variant="filled"
        >
          Successfully purchased ticket! Enjoy the show.
        </Alert>
      </Snackbar>
    </>
  );
}

const Centered = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default App;
