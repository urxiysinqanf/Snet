import ethers, { BigNumber } from "ethers";
import * as starknet from "starknet"

export const restoreSeedPhrase = (mnemonic) => ethers.Wallet.fromMnemonic(mnemonic);
const baseDerivationPath = "m/44'/9004'/0'/0";
const accountClassHash = "0x033434ad846cdd5f23eb73ff09fe6fddd568284a0fb7d1be20ee482f044dabe2";
const argentProxyClassHash = "0x25ec026985a3bf9d0cc1fe17326b245dfdc3ff89b8fde106542a3ea56c5a918";

export const getGroundKey = (index, privateKey) => {
  const masterNode = ethers.utils.HDNode.fromSeed(
    BigNumber.from(privateKey).toHexString()
  );
  const path = `${baseDerivationPath}/${index}`;
  const childNode = masterNode.derivePath(path);
  const groundKey =
    "0x" + starknet.ec.starkCurve.grindKey(childNode.privateKey);
  return groundKey;
};

export const precalculateAddress = (starkKeyPublic) => {
  const constructorCallData = starknet.CallData.compile({
    implementation: accountClassHash,
    selector: starknet.hash.getSelectorFromName("initialize"),
    calldata: starknet.CallData.compile({
      signer: starkKeyPublic,
      guardian: "0",
    }),
  });
  // to be deployed account contract address
  return starknet.hash.calculateContractAddressFromHash(
    starkKeyPublic, // salt
    argentProxyClassHash,
    constructorCallData,
    0
  );
};

export const starkProvider = new starknet.SequencerProvider({
    baseUrl: starknet.constants.BaseUrl.SN_MAIN,
})