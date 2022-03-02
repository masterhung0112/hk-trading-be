Thought: 
- Sharing code between packages
- Sharing serverless.yml
- Sharing an API Gateway endpoint
- Organize the boot of services depending on the usage of lambda function
- Organize Lambda functions
- Deploy an entire app

```
hk-trading-contract
|- serverless.common.yml


hk-tradng-pricing
|-
```

# hk-pd
Panda library implemented in Typescript

# hk-trading-chart
Main concern:
- [ ] Implement the system that can analyze the news, the candlesticks between the market
- [ ] Implement the chart like TradingView. [Ref](packages/hk-trading-chart/README.md)

# hk-cloud
This project try to provide the helper decorator and classes like nest.js for cloud-related architecture

# hk-technical-indicator
By using `hk-pd`, analyzing the candlestick, predict the candlestick pattern, resistance, support...

# hk-trading-contract
The common model for all financial projects

# hk-trading-pricing
Fetch the prices of currencies, coin from several sources. Ex. Binance, Forex