// "SPDX-License-Identifier: UNLICENSED"
pragma solidity ^0.6.9;

import {GelatoActionsStandard} from "../GelatoActionsStandard.sol";
import {
    IGelatoOutFlowAction
} from "../action_pipeline_interfaces/IGelatoOutFlowAction.sol";
import {DataFlow} from "../../gelato_core/interfaces/IGelatoCore.sol";
import {IERC20} from "../../external/IERC20.sol";
import {IBatchExchange} from "../../dapp_interfaces/gnosis/IBatchExchange.sol";
import {GelatoBytes} from "../../libraries/GelatoBytes.sol";
import {SafeERC20} from "../../external/SafeERC20.sol";
import {SafeMath} from "../../external/SafeMath.sol";

/// @title ActionWithdrawBatchExchange
/// @author Luis Schliesske & Hilmar Orth
/// @notice Gelato Action that withdraws funds from BatchExchange and returns withdrawamount
/// @dev Can be used in a GelatoActionPipeline as OutFlowAction.
contract ActionWithdrawBatchExchange is GelatoActionsStandard, IGelatoOutFlowAction {

    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    IBatchExchange public immutable batchExchange;

    constructor(IBatchExchange _batchExchange) public { batchExchange = _batchExchange; }

    // ======= DEV HELPERS =========
    /// @dev use this function to encode the data off-chain for the action data field
    function getActionData(address _token)
        public
        pure
        returns(bytes memory)
    {
        return abi.encodeWithSelector(this.action.selector, _token);
    }

    /// @dev Used by GelatoActionPipeline.isValid()
    function DATA_FLOW_OUT_TYPE() public pure virtual override returns (bytes32) {
        return keccak256("TOKEN,UINT256");
    }

    // ======= ACTION IMPLEMENTATION DETAILS =========
    /// @notice Withdraw token from Batch Exchange
    /// @dev delegatecallOnly
    /// @param _token Token to withdraw from Batch Exchange
    function action(IERC20 _token)
        public
        virtual
        delegatecallOnly("ActionWithdrawBatchExchange.action")
        returns (uint256 withdrawAmount)
    {
        uint256 preTokenBalance = _token.balanceOf(address(this));

        try batchExchange.withdraw(address(this), _token) {
            uint256 postTokenBalance = _token.balanceOf(address(this));
            if (postTokenBalance > preTokenBalance)
                withdrawAmount = postTokenBalance - preTokenBalance;
        } catch {
           revert("ActionWithdrawBatchExchange.withdraw _token failed");
        }
    }

    ///@dev Will be called by GelatoActionPipeline if Action.dataFlow.Out
    //  => do not use for _actionData encoding
    function execWithDataFlowOut(bytes calldata _actionData)
        external
        payable
        virtual
        override
        returns (bytes memory)
    {
        IERC20 token = abi.decode(_actionData[4:], (IERC20));
        uint256 withdrawAmount = action(token);
        return abi.encode(token, withdrawAmount);
    }

    // ======= ACTION TERMS CHECK =========
    // Overriding and extending GelatoActionsStandard's function (optional)
    function termsOk(
        uint256,  // taskReceipId
        address _userProxy,
        bytes calldata _actionData,
        DataFlow,
        uint256,  // value
        uint256  // cycleId
    )
        public
        view
        virtual
        override
        returns(string memory)
    {
        if (this.action.selector != GelatoBytes.calldataSliceSelector(_actionData))
            return "ActionWithdrawBatchExchange: invalid action selector";
        IERC20 token = abi.decode(_actionData[4:], (IERC20));
        bool tokenWithdrawable = batchExchange.hasValidWithdrawRequest(_userProxy, token);
        if (!tokenWithdrawable)
            return "ActionWithdrawBatchExchange: Token not withdrawable yet";
        return OK;
    }
}