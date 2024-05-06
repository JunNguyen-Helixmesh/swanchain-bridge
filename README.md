## Orchestrator bridge frontend

TODO: ~~Rewrite & restyling of code from
https://github.com/nitantchhajed/op-stack-bridge/tree/master~~

- ~~Figure out why page routing is not working.~~
- ~~Make adjustments to \_app as wagmiconfig is deprecated~~
- ~~Fix stretched assets~~
- Fix wallet login state persisting across routes
- Fix switch to swan/sepolia button
- Fix accounts routing
- Fix metamask button and icon
- Fix L2 testnet icon
- Fix justification of header icons
- Fix size of Wallet address/profile button
- Fix Popup window for View Deposit/ View Withdrawals/ Disconnect
- Fix depositing to Racenet instead of Swan
- Fix NaN ETH display on withdraw route

- get wallet address on landing withdraw-history

## Notes

- Create a .env.production file in root directory with the appropriate fields filled in.

- Rewritten for use of wagmi@2.2.1 and ethers 6.10.1 with TypeScript and NextJS
- [useSwitchNetwork](0.5.x.wagmi.sh/react/hooks/useSwitchNetwork) is now [useSwitchChain](wagmi.sh/react/api/hooks/useSwitchChain)
- Types require using TypeScript >=5.0.4.
- Since TypeScript does not follow semantic versioning it is highly recommended to lock Wagmi and TypeScript versions to specific patch releases and consider the possibility of types being fixed or upgraded between releases
- tsconfig.json should set strict to true in compilerOptions
- [ethers v6 uses ethers.JsonRPCProvider instead of ethers.providers.JsonRPCProvider](docs.ethers.org/v6/migrating/)
- [ethers v6 uses BrowserProvider instead of Web3Provider](docs.ethers.org/migrating/#migrate-providers)
- [useNetwork](0.5.x.wagmi.sh/react/hooks/useNetwork) depracated for [useAccount](wagmi.sh/react/guides/migrate-from-v1-to-v2#removed-usenetwork-hook)

Run the following commands to build

```
docker build -t orchestrator-bridge-ui .
docker run -p 3000:3000 orchestrator-bridge-ui

``
or

```

docker pull jameschennbai/orchestratorbridge-ui:platformfix

```
https://hub.docker.com/layers/jameschennbai/orchestratorbridge-ui/platformfix/images/sha256-68891b8e6861e27402442169a2d638cbafd83376c42749cb62ac8867afe7cbff?context=repo
```
