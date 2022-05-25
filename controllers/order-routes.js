require('dotenv').config();
const router = require('express').Router();
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);
const {updateRestaurantBalance} = require('../utils/routeHelper');

router.get('/donation-success', async (req, res) => {
  const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
  const customer = await stripe.customers.retrieve(session.customer);

  // donationAmount divided by 100 because amount is converted from pennies to dollars
  const donationAmount = JSON.parse(session.metadata.amount) / 100;
  const restaurantId = JSON.parse(session.metadata.restaurantId);

  updateRestaurantBalance(restaurantId, donationAmount);

  res.send(`<html><body><h1>Thank you for your $${donationAmount} donation, ${customer.name}!</h1></body></html>`);
});

router.get('/success', async (req, res) => {
  const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
  const customer = await stripe.customers.retrieve(session.customer);

  // Tally the purchase total
  let purchaseAmount = 0;
  const items = JSON.parse(session.metadata.items);
  items.forEach(item => {
    // divide by 100 because converting from pennies to dollars
    purchaseAmount += item.amount*item.quantity/100
  });

  const restaurantId = items[0].restaurant_id;

  res.send(`<html><body><h1>Thanks for your order, ${customer.name}!</h1></body></html>`);
});

module.exports = router;