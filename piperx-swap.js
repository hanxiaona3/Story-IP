import { ethers } from 'ethers';
import { PrivateKeys$18Wallets, PrivateKeys$136Wallets } from '../../util/privateKey.js';
import { RPC_provider,formHexData, sleep,NewPrivatKeys,walletContract} from '../../util/common.js';
import RPC from '../../config/runnerRPC-1.json' assert { type: 'json' };
import PiperXswapV2Router02 from './Contract/PiperXswapV2Router02.json' assert { type: 'json' };
import { wallet_create } from '../../util/wallet_create.js';

import pLimit from 'p-limit';
const CONCURRENCY_LIMIT=5;

  /**
   * 钱包发送交易程序，简化程序代码；
   * maxRetries为最大的尝试次数，默认是3次；
   * timeout为最大的时间周期,默认是10s，合约交互时间较长
   */

  async function walletSendtxData(wallet,txData,maxRetries = 4,timeout=50000){
    let retries = 0;
    let success = false;
    while (retries < maxRetries) {
        try {
            const txPromise = wallet.sendTransaction(txData);
            const transactionResponse= await Promise.race([
                txPromise,
                new Promise((_,reject)=>setTimeout(()=>reject(new Error('TimeOut')),timeout))                
            ]);
            const receipt = await transactionResponse.wait();
            if (receipt.status===1) {
              console.log("交易sucess，hash是:",receipt.hash); 
              retries=maxRetries;
              success=true;
            }else{
              throw new Error(`交易hash是failed，从新进行交易`);              
            }
            await sleep(2)         
            return 0;
        } catch (error) {
            // console.error(`Error occurred: ${error.message}`);//暂时屏蔽掉错误信息
            retries++;
            // console.error(`开始尝试第${retries}次,${error.message}`);
            console.error(`开始尝试第${retries}次`);
            if(retries >= maxRetries){
              console.log(`尝试${maxRetries}次仍然失败，退出交易`);
              // console.error(`kayakfinance领取测试币发生错误,开始尝试第${retries}次`);
              return 1;
                // throw new Error('Max retries exceeded'); 
            }
            await sleep(1);//等待3s时间
        }         
    }
}


async function piperx_IPswapUSDT(wallet){
    console.log(`IP测试币swap。。。。。。。。。。。。。。。。。。。。。`);
    const Wrapped_IP=`0x6e990040Fd9b06F98eFb62A147201696941680b5`;
    //approve过程
    let value=Math.round(Math.random()*100)/1000;
    if (value<=0.1) {
        value=0.02;
    }
    const amountInBig = ethers.parseEther(value.toString()); 
    let txData = {
        to: Wrapped_IP, 
        data: `0x095ea7b300000000000000000000000056300f2db653393e78c7b5ede9c8f74237b76f47${formHexData(BigInt(amountInBig).toString(16))}`,
        value: 0,
    };
    // console.log(txData);
    await walletSendtxData(wallet,txData);
    await sleep(3);
//swap过程
    try {
        const contract=new ethers.Contract(PiperXswapV2Router02.address,PiperXswapV2Router02.abi,wallet);
        const addresses=[
            "0x6e990040fd9b06f98efb62a147201696941680b5",
            "0x8812d810ea7cc4e1c3fb45cef19d6a7ecbf2d85d"
        ];        
        const txResponse= contract.swapExactETHForTokens(15791653056,addresses,wallet.address,Math.floor(Date.now()/1000)+360,{value:amountInBig});
        await walletContract(txResponse);
        
    } catch (error) {
        console.error(`Error occurred: ${error.message}`);
    }  
}
const main=async(privateKeys)=>{
    console.log(`当前时间点是：${new Date()}`);

    for (let index = 0; index < privateKeys.length; index++) {//shuffled_PrivateKeys.length
    const morphl2_wallet=new ethers.Wallet(privateKeys[index],await RPC_provider(RPC.iprpc));
    const address=morphl2_wallet.address;
    console.log(`第${index+1}个钱包，钱包地址是:${address}`);
    await piperx_IPswapUSDT(morphl2_wallet) 
}
    // const limit = pLimit(CONCURRENCY_LIMIT);
    // const tasks=privateKeys.map(privateKey=>
    //     limit(async ()=>{
    //         let wallet=new ethers.Wallet(privateKey,await RPC_provider(RPC.iprpc));
    //         console.log(`地址：${wallet.address}`);
    //         // console.log(`第${index+1}个钱包，地址：${Plume_wallet.address}`);
    //         await piperx_IPswapUSDT(wallet) 
    //     })
    //  );
    //  await Promise.allSettled(tasks)
    //  .then(()=>
    //      console.log(`任务已完成`)
    //  )
    //  .catch(error=>{
    //      console.error(error.message);
    //  });
     
}
    
main(PrivateKeys$18Wallets.slice(0)).catch(error=>{
    console.error(error.message);  
})

// main(wallet_create.slice(0,100)).catch(error=>{
//     console.error(error.message);  
// })
//循环获取数量
// const shuffled_PrivateKeys=NewPrivatKeys(privateKeys);
// for (let index = 0; index < privateKeys.length; index++) {//shuffled_PrivateKeys.length
//     const morphl2_wallet=new ethers.Wallet(privateKeys[index],morphl2_Provider);
//     const address=morphl2_wallet.address;
//     console.log(`第${index+1}个钱包，钱包地址是:${address}`);
//     await claimMOCKToken(morphl2_wallet) 
// }

