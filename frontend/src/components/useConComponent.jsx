import {
    useContractWrite,
    useContract,
    Web3Button,
  } from "@thirdweb-dev/react";

    function ConComponent() {
    const contractAddress = process.env.REACT_APP_CONTRACT_ADDR ? process.env.REACT_APP_CONTRACT_ADDR : "INSERT_CONTRACT_ADDR";
    const { contract } = useContract(contractAddress);
    const { mutateAsync, isLoading, error } = useContractWrite(
      contract,
      "setName"
    );
  
    return (
      <Web3Button
        contractAddress={contractAddress}
        action={() => mutateAsync({ args: ["My Name"] })}
      >
        Send Transaction
      </Web3Button>
    );
  }
  
  export default ConComponent;