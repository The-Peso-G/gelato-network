import { task } from "@nomiclabs/buidler/config";
import { defaultNetwork } from "../../../../../../buidler.config";
import { utils, constants } from "ethers";

export default task(
  "gc-add-provider-modules",
  `Sends tx to GelatoCore.addProviderModule() on [--network] (default: ${defaultNetwork})`
)
  .addOptionalParam(
    "modulename",
    "Gelato Provider Module name (will be used to get default constructor args if no constructor args are given). Only 1 via CLI."
  )
  .addOptionalParam(
    "moduleaddress",
    "Address of module, constructor args need to be passed"
  )
  .addOptionalParam(
    "providerindex",
    "index of user account generated by mnemonic to fetch provider address",
    2,
    types.int
  )
  .addOptionalParam("gelatocoreaddress", "Provide this if not in bre-config")
  .addFlag("events", "Logs parsed Event Logs to stdout")
  .addFlag("log", "Logs return values to stdout")
  .setAction(async (taskArgs) => {
    try {
      if (taskArgs.modulename && taskArgs.moduleaddress)
        throw Error(
          "Cant pass module name and module address at the same time"
        );
      // TaskArgs Sanitzation
      // Gelato Provider is the 3rd signer account
      const {
        [taskArgs.providerindex]: gelatoProvider,
      } = await ethers.getSigners();

      if (!gelatoProvider)
        throw new Error("\n gelatoProvider not instantiated \n");

      const gelatoCore = await run("instantiateContract", {
        contractname: "GelatoCore",
        contractaddress: taskArgs.gelatocoreaddress,
        signer: gelatoProvider,
        write: true,
      });

      if (taskArgs.modulename) {
        taskArgs.moduleaddress = await run("bre-config", {
          deployments: true,
          contractname: taskArgs.modulename,
        });
      }

      // GelatoCore contract call from provider account
      // address _executor,
      // TaskSpec[] memory _taskSpecs,
      // IGelatoProviderModule[] memory _modules
      const tx = await gelatoCore.addProviderModules([taskArgs.moduleaddress]);

      if (taskArgs.log)
        console.log(`\n\ntxHash addProviderModules: ${tx.hash}`);
      const { blockHash: blockhash } = await tx.wait();

      if (taskArgs.events) {
        await run("event-getparsedlogsallevents", {
          contractname: "GelatoCore",
          contractaddress: gelatoCore.address,
          blockhash,
          txhash: tx.hash,
          log: true,
        });
      }

      if (taskArgs.log) console.log(`✅`);
      return tx.hash;
    } catch (error) {
      console.error(error, "\n");
      process.exit(1);
    }
  });