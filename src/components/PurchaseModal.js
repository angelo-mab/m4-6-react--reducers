// NOTE: The workshop README recommends usign the `Dialog` from
// Material UI. This solution uses a different modal, from Reach UI.
//
// Ultimately it doesn't make much difference; the strategy was
// changed because Material UI seemed like a little bit less work,
// but both approaches are totally valid!
import React from 'react';
import styled from 'styled-components';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import CircularProgress from '@material-ui/core/CircularProgress';

import { decodeSeatId } from '../helpers';

import Modal from './Modal';
import Spacer from './Spacer';
import { BookingContext } from './BookingContext';
import { SeatContext } from './SeatContext';

const PurchaseModal = () => {
  const {
    selectedSeatId,
    status,
    error,
    price,
    actions: {
      cancelBookingProcess,
      purchaseTicketRequest,
      purchaseTicketSuccess,
      purchaseTicketFailure,
    },
  } = React.useContext(BookingContext);
  const {
    actions: { markSeatAsPurchased },
  } = React.useContext(SeatContext);

  const [creditCard, setCreditCard] = React.useState('');
  const [expiration, setExpiration] = React.useState('');

  const { rowName, seatNum } = decodeSeatId(selectedSeatId);

  return (
    <Modal
      isOpen={!!selectedSeatId}
      onClose={cancelBookingProcess}
      aria-label="Ticket purchasing flow"
    >
      <Title>Purchase ticket</Title>
      <p>
        You're purchasing <strong>1</strong> ticket for the price of ${price}.
      </p>

      <TicketTable aria-label="ticket information">
        <TableHead>
          <TableRow>
            <TableCell>Row</TableCell>
            <TableCell>Seat</TableCell>
            <TableCell>Price</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>{rowName}</TableCell>
            <TableCell>{seatNum}</TableCell>
            <TableCell>${price}</TableCell>
          </TableRow>
        </TableBody>
      </TicketTable>

      <Form
        onSubmit={ev => {
          ev.preventDefault();

          purchaseTicketRequest();

          fetch('/api/book-seat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              creditCard,
              expiration,
              seatId: selectedSeatId,
            }),
          })
            .then(res => res.json())
            .then(json => {
              if (json.success) {
                purchaseTicketSuccess();
                markSeatAsPurchased(selectedSeatId);
              } else {
                purchaseTicketFailure(json.message);
              }
            })
            .catch(err => {
              console.error(err);
              purchaseTicketFailure('An unknown error has occurred');
            });
        }}
      >
        <h3>Enter payment details</h3>
        <Row>
          <TextField
            variant="outlined"
            label="Credit card"
            type="text"
            value={creditCard}
            onChange={ev => setCreditCard(ev.currentTarget.value)}
            style={{ flex: 2 }}
          />
          <Spacer size={16} />
          <TextField
            variant="outlined"
            label="Expiration"
            type="text"
            value={expiration}
            onChange={ev => setExpiration(ev.currentTarget.value)}
            style={{ flex: 1 }}
          />
          <Spacer size={16} />
          <PurchaseButton variant="contained" color="primary" type="submit">
            {status === 'awaiting-response' ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
                'Purchase'
              )}
          </PurchaseButton>
        </Row>
        {error && <Error>{error}</Error>}
      </Form>
    </Modal>
  );
};

const Title = styled.h1`
  margin-bottom: 16px;
`;

const Form = styled.form`
  margin-left: -32px;
  margin-right: -32px;
  padding: 32px;
  background: #eee;
`;

const Row = styled.div`
  display: flex;
  padding-top: 16px;
`;

const TicketTable = styled(Table)`
  width: 75% !important;
  margin-top: 16px;
  margin-bottom: 32px;
  margin-left: auto;
  margin-right: auto;
`;

const PurchaseButton = styled(Button)`
  color: white;
  width: 130px;
`;

const Error = styled.div`
  color: red;
  padding: 16px 0;
  text-align: center;
`;

export default PurchaseModal;
