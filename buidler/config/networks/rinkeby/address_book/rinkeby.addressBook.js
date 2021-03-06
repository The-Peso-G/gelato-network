import { eoas } from "./rinkeby.eoas";
import { erc20s } from "./rinkeby.erc20s";
import { userProxies } from "./rinkeby.userProxies";

export const addressBook = {
  // EOAs
  EOA: eoas,

  // ERC20s
  erc20: erc20s,

  // Gelato
  gelatoExecutor: {
    // rinkeby
    default: "0x4d671CD743027fB5Af1b2D2a3ccbafA97b5B1B80", // Luis Index 1
  },
  gelatoGasPriceOracle: {
    // rinkeby
    chainlink: "0xEc2BCB887d7E50d06AeE7b1b5C79eA7816d5e167",
  },
  gelatoProvider: {
    default: "0x518eAa8f962246bCe2FA49329Fe998B66d67cbf8",
  },

  // Gnosis
  gnosisProtocol: {
    batchExchange: "0xC576eA7bd102F7E476368a5E98FA455d1Ea34dE2",
  },
  gnosisSafe: {
    mastercopyOneOneOne: "0x34CfAC646f301356fAa8B21e94227e3583Fe3F5F",
    gnosisSafeProxyFactory: "0x76E2cFc1F5Fa8F6a5b3fC4c8F4788F0116861F9B",
    cpkFactory: "0x336c19296d3989e9e0c2561ef21c964068657c38",
    multiSend: "0x29CAa04Fa05A046a05C85A50e8f2af8cf9A05BaC",
  },

  // Kyber
  kyber: {
    // rinkeby
    ETH: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    proxy: "0xF77eC7Ed5f5B9a5aee4cfa6FFCaC6A4C315BaC76",
  },

  // Maker
  maker: {
    medianizer2: "0x7e8f5b24d89F8F32786d564a5bA76Eb806a74872",
  },

  // Uniswap
  uniswap: {
    uniswapFactory: "0xf5D915570BC477f9B8D6C0E980aA81757A3AaC36",
    daiExchange: "0x77dB9C915809e7BE439D2AB21032B1b8B58F6891",
  },

  // UserProxies
  userProxy: userProxies,
};
