const ethers=require('ethers')
const axios=require('axios')
const {PrivateKeys$18Wallets,PrivateKeys$136Wallets}=require('../../util/privateKey.cjs');
const {NewPrivatKeys,sleep,formHexData,transactionData,walletSendtxData}=require('../../util/common.cjs')
const RPC=require('../../config/runnerRPC.json');


const morphl2_Provider=new ethers.JsonRpcProvider(RPC.sepolia);//设置链接PRC

async function NFT_minted(wallet) {
    console.log(`mint NFT过程。。。。。。。。。。。。。。。。`);
    const KUMAMint='0x0f00a58A741aD6C9DFb549e8B0aad1e9bC48D9f1';//合约地址
    // console.log(`NFT获取进行。。。。。。。。。。。。。。。。。。`);
    let address=wallet.address;
    //approve程序

    let txData = {
        from:address,
        to: KUMAMint,
        data: `0xa6ec8a33000000000000000000000000${address.substring(2)}`,
        value: 0,
    };
    await walletSendtxData(wallet,txData);
   
}

const main=async(privateKeys)=>{

    for (let index =0; index <privateKeys.length; index++) {//shuffled_PrivateKeys.length
        const morphl2_wallet=new ethers.Wallet(privateKeys[index],morphl2_Provider);
        console.log(`第${index+1}个钱包,地址是${morphl2_wallet.address}`);
        await NFT_minted(morphl2_wallet)
    }

}

main(PrivateKeys$136Wallets)