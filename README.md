## Orchestrator bridge frontend

TODO: Rewrite & restyling of code from 
https://github.com/nitantchhajed/op-stack-bridge/tree/master

## Notes

- Create a .env.production file in root directory with the appropriate fields filled in.

- Rewritten for use of wagmi@2.2.1 with TypeScript and NextJS
 - [useSwitchNetwork](0.5.x.wagmi.sh/react/hooks/useSwitchNetwork) is now [useSwitchChain](wagmi.sh/react/api/hooks/useSwitchChain)
 - Types require using TypeScript >=5.0.4.
 - Since TypeScript does not follow semantic versioning it is highly recommended to lock Wagmi and TypeScript versions to specific patch releases and consider the possibility of types being fixed or upgraded between releases
 - tsconfig.json should set strict to true in compilerOptions

- Run the following commands to build
```
docker build -t orchestrator-bridge-ui .
docker run -p 3000:3000 orchestrator-bridge-ui

```