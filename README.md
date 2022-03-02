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

Main concern:
- [ ] Implement the system that can analyze the news, the candlesticks between the market
- [ ] Implement the chart like TradingView. [Ref](packages/hk-trading-chart/README.md)