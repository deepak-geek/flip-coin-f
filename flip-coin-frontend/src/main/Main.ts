import { getPetitionApi, isConnected, setContractAddress } from "./AppState";
import {
  connectMetaMaskWalletClick,
  connectMpcWalletClick,
  connectPrivateKeyWalletClick,
  disconnectWalletClick,
  updateContractState,
  updateInteractionVisibility,
} from "./WalletIntegration";

// Setup event listener to connect to the MPC wallet browser extension
const connectWallet = <Element>document.querySelector("#wallet-connect-btn");
connectWallet.addEventListener("click", connectMpcWalletClick);

// Setup event listener to connect to the MetaMask snap
const metaMaskConnect = <Element>document.querySelector("#metamask-connect-btn");
metaMaskConnect.addEventListener("click", connectMetaMaskWalletClick);

// Setup event listener to connect to the MetaMask snap
const pkConnect = <Element>document.querySelector("#private-key-connect-btn");
pkConnect.addEventListener("click", connectPrivateKeyWalletClick);

// Setup event listener to drop the connection again
const disconnectWallet = <Element>document.querySelector("#wallet-disconnect-btn");
disconnectWallet.addEventListener("click", disconnectWalletClick);

// Setup event listener that sends a transfer transaction to the contract.
// This requires that a wallet has been connected.

const signBtn = <Element>document.querySelector("#sign-btn");
signBtn.addEventListener("click", signAction);

const addressBtn = <Element>document.querySelector("#address-btn");
addressBtn.addEventListener("click", contractAddressClick);

const updateStateBtn = <Element>document.querySelector("#update-state-btn");
updateStateBtn.addEventListener("click", updateContractState);

/** Function for the contract address form.
 * This is called when the user clicks on the connect to contract button.
 * It validates the address, and then gets the state for the contract.
 */
function contractAddressClick() {
  const address = (<HTMLInputElement>document.querySelector("#address-value")).value;
  const regex = /[0-9A-Fa-f]{42}/g;
  if (address === undefined) {
    throw new Error("Need to provide a contract address");
  } else if (address.length != 42 || address.match(regex) == null) {
    // Validate that address is 21 bytes in hexidecimal format
    console.error(`${address} is not a valid PBC address`);
  } else {
    const currentAddress = <HTMLInputElement>document.querySelector("#current-address");
    currentAddress.innerHTML = `Petition Address: ${address}`;
    const browserLink = <HTMLInputElement>document.querySelector("#browser-link");
    browserLink.innerHTML = `<a href="https://browser.testnet.partisiablockchain.com/contracts/${address}" target="_blank">Browser link</a>`;
    setContractAddress(address);
    updateInteractionVisibility();
    updateContractState();
  }
}

/** Action for the sign petition button */
function signAction() {
  const api = getPetitionApi();
  if (isConnected() && api !== undefined) {
    const browserLink = <HTMLInputElement>document.querySelector("#sign-transaction-link");
    browserLink.innerHTML = '<br><div class="loader"></div>';
    api
      .sign()
      .then((transactionHash) => {
        browserLink.innerHTML = `<br><a href="https://browser.testnet.partisiablockchain.com/transactions/${transactionHash}" target="_blank">Transaction link in browser</a>`;
      })
      .catch((msg) => {
        browserLink.innerHTML = `<br>${msg}`;
      });
  }
}
