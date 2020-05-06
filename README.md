# Workshop: Ticket-buying widget

In today's workshop, we'll be building a ticket-buying widget, for buying specific seats at a concert (or hockey game, or airplane). Here's a GIF of the flow:

![demo flow](./__lecture/assets/demo.gif)

To add a sense of realism, this workshop features **a Node.js server**. This server will tell you which seats are available, and let you process (fake) credit cards to charge tickets.

## Starting point

The `workshop` folder includes a barebones React application. You'll notice that you're given the "seat" asset, located in `src/assets/seat-available.svg`.

### Included Server

In the workshop folder, you'll see a `/server` directory. Feel free to poke around in it if you'd like, to see how it works!

There is also a new script in the `package.json`. To run this project, you'll need two active terminal windows, each running one of these commands:

- `yarn start`
- `yarn start:server`

This will run both a typical React application as well as our Node server.

> **Important:** To simulate a real "production" server, requests fail sometimes. If the server sends an error, it might not be a problem with your code, but rather a simulation of a network issue.

### Server endpoints

The server exposes the following endpoints:

#### GET `/api/seat-availability`

Returns JSON in the following format:

```json
{
  "numOfRows": 8,
  "seatsPerRow": 12,
  "seats": {
    "A-1": {
      "price": 225,
      "isBooked": false
    },
    "A-2": {
      "price": 225,
      "isBooked": false
    },
    "A-3": {
      "price": 225,
      "isBooked": false
    },
    // ...And many more in the "A" row
    "B-1": {
      "price": 215,
      "isBooked": false
    }
  }
}
```

The `seats` key contains all the information about every seat available. Every seat has a unique ID, like `C-11`:

- Rows are lettered from A to H, with `A` seats being the closest to the front (and the most expensive)
- Each row has 12 seats, numbered from 1 to 12. Seat # doesn't affect price.

#### POST `/api/book-seat`

Make a POST to this endpoint when the user is purchasing a ticket. It expects the following body, sent as JSON:

```json
{
  "seatId": "A-3",
  "creditCard": "1234123412341234",
  "expiration": "12/34"
}
```

These are the following validations applied:

- If the seat ID doesn't exist, or the seat is already booked, the server will return a 400 error
- If either the `creditCard` or `expiration` fields are left blank, the server will return a 400 error. The server doesn't actually care what you send it, so long as a value is provided for each field.
- Even requests (eg. 2nd request, 4th request, etc) will return a 500 error. **This is meant to simulate network errors.** Your code is not wrong :) this simulation is to make sure that your code is _gracefully handling_ those errors, and showing the user an error.

If there is an error, the response body will look like this:

```json
{
  "message": "An unknown error has occurred. Please try your request again."
}
```

If all is right with the request, and it isn't a simulated network error, you'll get the following response:

```json
{
  "success": true
}
```

#####

---

## Exercise 1: Adding dependencies

For this project, we'll use the following dependencies:

- `@tippy.js/react`
- `@material-ui/core`
- `@material-ui/lab`
- `react-icons-kit`
- `styled-components`

> the `@` in front of most of these package names are called a _namespace_ – they allow package authors to group multiple packages under the same "domain"

Install all of these packages with `yarn add`. You can chain them together with a space, to do it all in 1 command:

```bash
yarn add package-1 package-2 package-3
```

## Exercise 2: Managing state

### 2A: Setting up context and reducers

The interesting thing about this challenge is that there is some data that lives on the server—the set of seats—and we need to copy that to the client. But we will also need to keep the seat data in React state, since we need to mark seats as booked after the user purchases them!

First, let's create a context component to manage everything related to seats.

Take the time to **write this out**. Don't copy and paste! It's critical to build the muscle memory so that you can create context components without copying.

Create this file in `src/components/SeatContext.js`

```js
export const SeatContext = React.createContext();

const initialState = {
  hasLoaded: false,
  seats: null,
  numOfRows: 0,
  seatsPerRow: 0,
};

function reducer(state, action) {
  // TODO
}

export const SeatProvider = ({ children }) => {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  const receiveSeatInfoFromServer = (data) => {
    dispatch({
      type: "receive-seat-info-from-server",
      ...data,
    });
  };

  return (
    <SeatContext.Provider
      value={{
        state,
        actions: {
          receiveSeatInfoFromServer,
        },
      }}
    >
      {children}
    </SeatContext.Provider>
  );
};
```

A few notes here:

- We create a `SeatContext` and export it. This will be used to _subscribe_ to the data held within this context.
- The `SeatProvider` is what actually makes this data available to the React app, so that components further down the tree can subscribe to it.
- `receiveSeatInfoFromServer` and `markSeatAsPurchased` are functions that dispatch actions. Sometimes, they're called **action creators**. They're optional - if you wanted, you could pass `dispatch` directly - but it's a best practice to do it this way.

You'll notice, the `reducer` has a TODO. It's your job to write this code! But don't worry about it just yet, first we need to make our network requests.

Finally for this step, we need to wrap our entire application in the SeatProvider component. Head over to `src/index.js`, and wrap the root node:

```diff
import React from 'react';
import ReactDOM from 'react-dom';

import App from './components/App';
+import { SeatProvider } from './components/SeatContext';

const rootElement = document.getElementById('root');

ReactDOM.render(
- <App />,
+ <SeatProvider>
+   <App />
+ </SeatProvider>,
  rootElement
);

```

## 2B: Fetching data

Let's go to our `App.js`. We'll subscribe to the context we created by importing it and using the `useContext` hook:

```diff
import React from 'react';

+import { SeatContext } from './SeatContext';

function App() {
+ const {
+   actions: { receiveSeatInfoFromServer },
+ } = React.useContext(SeatContext);

  return (
    <>
      <GlobalStyles />
      TODO: Build stuff!
    </>
  );
}
```

When the `App` renders for the first time, we want to make a `fetch` request to our `/api/seat-availability` route. We can use `useEffect` for this:

```diff
function App() {
  const {
    actions: { receiveSeatInfoFromServer },
  } = React.useContext(SeatContext);

+ React.useEffect(() => {
+   fetch('/api/seat-availability')
+     .then(res => res.json())
+     .then(data => console.log(data));
+ }, []);

  return (
    <>
      <GlobalStyles />
      TODO: Build stuff!
    </>
  );
}
```

As a reminder: `useEffect` takes two arguments, and the second is a _list of dependencies_. We pass an empty array because we only want this code to run once, the very first time the component renders. _If you forget this array, bad things will happen._ 😬

In this code snippet, we're simply logging the result of our fetch request. Instead, we should use the `receiveSeatInfoFromServer` function to update our React state with that info!

Remember how we left the `reducer` blank, in `SeatContext`? Now's the time to hook that all up.

Take a moment to give this a shot yourself. Add some more `console.log`s to understand which functions fire when, and what the available data is.

.

..

...

....

.....

......

.......

......

.....

....

...

..

.

Update the `useEffect` in `App` to call `receiveSeatInfoFromServer` with the data:

```diff
  const {
    actions: { receiveSeatInfoFromServer },
  } = React.useContext(SeatContext);

  React.useEffect(() => {
    fetch('/api/seat-availability')
      .then(res => res.json())
-     .then(data => console.log(data));
+     .then(data => receiveSeatInfoFromServer(data));
  }, []);
```

Inside the reducer, we want to produce a new state that matches the shape of the `initialState`, using the data available.

If we add a `console.log` to our reducer, here's what we get:

```js
const initialState = {
  hasLoaded: false,
  seats: null,
  numOfRows: 0,
  seatsPerRow: 0,
};

function reducer(state, action) {
  console.log(action);
  /*
  Logs:

  {
    type: 'receive-seat-info-from-server',
    seats: // big object full of seats
    numOfRows: 8,
    seatsPerRow: 12,
  }
  */
}
```

This looks an awful lot like the data we already have, in initialState!

Let's add a `switch`, and copy over the relevant bits:

```diff
function reducer(state, action) {
- // TODO
+ switch (action.type) {
+   case 'receive-seat-info-from-server': {
+     return {
+       ...state,
+       hasLoaded: true,
+       seats: action.seats,
+       numOfRows: action.numOfRows,
+       seatsPerRow: action.seatsPerRow,
+     };
+   }
+
+   default:
+     throw new Error(`Unrecognized action: ${action.type}`);
+ }
}
```

When `dispatch` is called with the `'receive-seat-info-from-server'` action, we want to return a new state, which updates:

- The `hasLoaded` state, from `false` to `true` (since we just finished getting our data!)
- The `seats`, `numOfRows`, and `seatsPerRow` that we got from the server.

We've done a lot of work so far, and not much in the UI is visible! By checking `console.log`, we should have _some_ confidence that what we're doing is right, but let's actually add some stuff to the DOM.

Inside `App`, let's also pull some more data out of context, and render it:

```diff
function App() {
  const {
+   state: { numOfRows },
    actions: { receiveSeatInfoFromServer },
  } = React.useContext(SeatContext);

  React.useEffect(() => {
    fetch('/api/seat-availability')
      .then(res => res.json())
      .then(data => receiveSeatInfoFromServer(data));
  });

  return (
    <>
      <GlobalStyles />
-     TODO: Build stuff!
+     This venue has {numOfRows} rows!
    </>
  );
}
```

### Exercise 3: Initial UI

Let's import the `TicketWidget` component, and render it inside `App`:

This component is partially done. It contains some of the required UI, but not all. (I wonder if this is the work of the dev that started Slingshot Air but never finished... Seems like we're always cleaning up after someone. 😅)

This `TicketWidget` component has the following responsibilities:

- Subscribe to the React context with `useContext`
- Use the `numOfSeats` and `seatsPerRow` state to render the correct number of seats.

When you're done, you should have a UI like this:

![TicketWidget initial UI](./__lecture/assets/just-the-seats.png)

Critically, you'll notice that there are 8 rows, with 12 seats per row. This is because this is what the server tells us, with the `numOfSeats` and `seatsPerRow` variables. Your job is to take this data and produce this UI :)

_HINT:_ Remember, the image is provided in `src/assets/seat-available.svg`. Images can be `import`ed just like JS modules!

```js
import happyMealSrc from "../__lecture/assets/happy-meal.jpg";

const McDonalds = () => {
  return <img alt="a meal with a toy" src={happyMealSrc} />;
};
```

_HINT:_ You can use the `range` function, provided in `src/utils`. For example:

```js
const SomeComponent = () => {
  return (
    <div>
      {range(5).map((index) => (
        <span>{index}</span>
      ))}
    </div>
  );
};

// This will render:
<div>
  <span>0</span>
  <span>1</span>
  <span>2</span>
  <span>3</span>
  <span>4</span>
</div>;
```

_HINT:_ You'll need to use `React.useContext(SeatContext)` to get the data.

### Exercise 4: Polishing this UI

There are a few things that this UI doesn't yet do:

1. There is no loading state. It should show a loading spinner while we wait for that data to come in.
2. It should "gray out" any seats that are not available (already booked), according to the server data
3. There should be a tooltip on hover that shows the price per seat (using server data).

This is a challenging task! Don't be afraid to ask TCs for help.

At the end of this task, your UI should look like this:

![TicketWidget polished UI](./__lecture/assets/ex-4.gif)

_HINT:_ For the loading spinner, you can use the `CircularProgress` component from Material UI: https://material-ui.com/components/progress/

_HINT:_ For the "greyed out" seats, you can use a CSS filter:

```css
filter: grayscale(100%);
```

_HINT:_ For the tooltip, check out the Tippy.js/react docs! https://www.npmjs.com/package/@tippy.js/react

### Exercise 5: Preparing for purchasing

Right now, you're probably rendering a bunch of seat images inside the `TicketWidget` component. We need to do a bit of prep work.

First, if you haven't already, create a `Seat` component, and move the Seat tooltip and greying-out logic to the Seat component. Inside your TicketWidget component, you should be left with something like this:

```js
{
  range(seatsPerRow).map((seatIndex) => {
    const seat = seats[seatId];

    return (
      <SeatWrapper key={seatIndex}>
        <Seat
          rowIndex={rowIndex}
          seatIndex={seatIndex}
          width={36}
          height={36}
          price={seat.price}
          status={seat.isBooked ? "unavailable" : "available"}
        />
      </SeatWrapper>
    );
  });
}
```

Inside your `Seat` component, wrap the image in a `<button>`. This is important because we'll soon allow for purchasing buttons by clicking on the seat, and we should never put `onClick` events on an `img` tag, or anything other than a `<button>`, for keyboard users.

We can add `disabled={true}` to this button if the seat is booked.

### Exercise 6: Purchase state

Let's watch the GIF from the beginning again:

![demo flow](./__lecture/assets/demo.gif)

(To view the GIF in VS Code: open the Command Palette with cmd+shift+P or control+shift+P, and start typing "Markdown: Open preview to the side". The option should pop up as you type, and you can select it).

There are a few distinct "statuses":

- The initial looking-at-the-seats initial status
- Looking at the purchase modal, after clicking on a seat
- Waiting for the response, after submitting the credit card info (the 1 second while the button has a spinner in it)
- The error status, when the credit card info is incomplete
- The "success" status, after completing a purchase, with the happy green banner showing.

We should model this in our state. But where should it live?

Let's create another context component, `BookingContext`. Follow many of the same steps as before. For `initialState`, pass it an object like this:

```js
const initialState = {
  status: "idle",
  error: null,
  selectedSeatId: null,
  price: null,
};
```

`status` is the state we mentioned earlier, which tracks all the distinct moments in time that exist during the booking process. Here are the possible values:

- `idle`
- `seat-selected`
- `awaiting-response`
- `error`
- `purchased`

Here are the steps you should complete for this exercise. Because we've done something similar already, not very much detail is given:

- Wrap the Provider around the root node in `src/index`
- Create an action with the type `begin-booking-process`, and dispatch that action when clicking an available seat
- Update the reducer to update the state accordingly, when `begin-booking-process` is dispatched.

### Exercise 7: Purchasing!

#### Exercise 7A: Showing and hiding the modal

When clicking a seat, we should open a modal. Let's create that now.

Create a new component, `PurchaseModal`. We'll use the `Dialog` component from Material UI. The documentation is super useful, and can be found here: https://material-ui.com/components/dialogs/

(For Material UI docs in general, notice the `< >` icon below all code snippets; clicking it shows the _full_ version, with all the imports and setup logic)

The `Dialog` component takes an `open` boolean prop, which controls whether it's open or not.

In your new `PurchaseModal` component, subscribe to the `BookingContext` you created, and use it to figure out the current state. You can then add some logic like this:

```js
// Inside `PurchaseModal.js`:
<Dialog
  open={selectedSeatId !== null}
>
```

This way, the `PurchaseModal` will only be shown when the user has an active seat selected, which happens when the user clicks on an available seat.

> The solution GIFs we've been looking at used a slightly different modal solution. Don't worry if your modal doesn't appear identical.

`Dialog` also takes a `handleClose` function, which the component will call if the user tries to close the modal by clicking the backdrop or pressing "Escape". Create a new action, `cancel-booking-process`, which re-initializes the state, setting `selectedSeatId` to `null` and resetting the other values.

At this point, you should be able to see a modal by clicking a seat, and dismiss the modal to return to the original view.

### Exercise 7B: Populating the modal

The modal should show a little table with the seat information, as well as a form for the user to enter their credit cards. Browse the Material UI components to find some helpful pieces. Visit https://material-ui.com/, and click the hamburger menu in the top left to show the sidebar. Then, expand "Components" to see a categorized list of available components.

(hint: you probably want a couple things from the "Inputs" section!)

Your goal should be to create a UI that looks something like this, pulling all relevant data from the `BookingContext` state:

![Modal contents](./__lecture/assets/modal.png)

You can also create two new pieces of React state: `creditCard` and `expiration`. Use the `useState` hook for both of these pieces of state:

```js
const [creditCard, setCreditCard] = React.useState("");
const [expiration, setExpiration] = React.useState("");
```

You should update this state when the user types in the text inputs, so that the React state is always in sync with what's shown on the page form.

### Exercise 7C: Sending the request

When the user clicks "Purchase", we want to make a request to our backend. The top of this README includes the list of API endpoints and how to use them. Make a POST to `/api/book-seat` with the specified data.

For consistency, you can create three new action types:

- `purchase-ticket-request`
- `purchase-ticket-failure`
- `purchase-ticket-success`

THe moment the user clicks "Purchase", you should dispatch that first action type to update the state: We've moved from the "seat-selected" status to the "awaiting-response" one!

If the server returns an error (which will happen 50% of the time, by design!), you can dispatch `purchase-ticket-failure`. This should set the status to `error`, and use the `message` field to update the `error` field in your state.

For example, an error should transform this state...

```json
{
  "status": "awaiting-response",
  "error": null,
  "selectedSeatId": "C-3",
  "price": 205
}
```

...into this one:

```json
  "status": "error",
  "error": "Please provide credit card information!",
  "selectedSeatId": "C-3",
  "price": 205
```

If the server returns a successful message, we can dispatch the `purchase-ticket-success` event, and update the state to this:

```json
  "status": "purchased",
  "error": null,
  "selectedSeatId": null,
  "price": null
```

Notice that we've unset `selectedSeatId` and `price`; now that we've purchased the seat, we can close that modal!

### Exercise 8: Finishing touches

We're in pretty good shape! There are a few final things we should add though.

1. Snackbar

If we successfully purchase a ticket, we want to show a success snackbar:

![Success snackbar](./__lecture/assets/snackbar.png)

This is a component from Material UI. We can use the `BookingContext` status to decide whether to show it (if the `status` is `purchased`). Additionally, we need to be able to dismiss it; create a new action that sets the status back to `idle`, which will automatically hide the snackbar.

2. Marking the seat as sold

If the "A-1" seat in the corner is available, I can go through the flow and purchase it. The server will mark it as sold, but after the modal closes, the seat will still be green on my screen!

If I refresh the page, the seat will correctly be marked as unavailable, but we should do that automatically.

To do this, we'll need to add a new action to our `SeatContext`. The type should be `mark-seat-as-purchased`, and it should be dispatched after the seat has been purchased. It should update the seat to `isBooked: true`.

---

# Stretch goals

This is a _very_ long workshop, so it is unlikely that you'll have time for these stretch goals!

Just in case, though, some are provided:

### Stretch goal 1: Decorated seats

After purchasing a seat, it becomes grey, the same as any other unavailable seat. Ideally, this seat would be visually distinct, to indicate that the current user has purchased it! Maybe a checkmark could be shown on top of it?

![Checkmark showing the previously-purchased seat](./__lecture/assets/purchased-indicator.png)

### Stretch goal 2: Purchasing multiple seats

Right now, seats can only be purchased one at a time. We can imagine maybe someone would like to buy multiple seats at once.

Update the UI so that clicking a seat "selects" it, and as long as at least 1 seat is selected, a "Buy" button is shown, below the seating plan. Clicking the "Buy" button opens the modal, and all selected seats are shown in the modal. The total price should equal to the sum total of all selected seats.

### Stretch goal 3: Responsive design

Expose the development server to the internet using something like [ngrok](https://ngrok.com/), and access the page on your phone. Is it usable? Does it look right?

Chances are, there are visual issues with this UI. Update it so that it looks and works great on a mobile device

_HINT:_ On mobile devices, large tap targets are key. If you try and squeeze 12 seats per row onto a narrow phone, the seats will be too tiny to tap! Instead, allow mobile users to swipe horizontally to view all seats.
