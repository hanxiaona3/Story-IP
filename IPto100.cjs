const ethers=require('ethers')
const {PrivateKeys$18Wallets,PrivateKeys$136Wallets}=require('../../util/privateKey.cjs');
const {wallet_create}=require('../../util/wallet_create.cjs');
const {NewPrivatKeys,sleep,formHexData, walletSendtxData}=require('../../util/common.cjs')
const RPC=require('../../config/runnerRPC-1.json');

// const morphl2_PRC='https://rpc-quicknode-holesky.morphl2.io';//'https://rpc-holesky.morphl2.io';

const morphl2_Provider=new ethers.JsonRpcProvider(RPC.story);//设置链接PRC
const temp_wallet=new ethers.Wallet(PrivateKeys$18Wallets[15],morphl2_Provider);
//claimMOCKToken函数
async function claimMOCKToken(address1){
    
    // console.log(`发送交易。。。。。。。。。。。。。。。。。。。。。`);
    let value=Math.round(Math.random()*100)/500;
    if (value<0.1) {
        value=0.1;
    } 
    console.log(`交互数量是：${value}`);
    let value1=ethers.parseEther(value.toString());
    let txData = {
        from:temp_wallet.address,
        to: address1, 
        data: '0x',
        value: value1
    };
    await walletSendtxData(temp_wallet,txData);
    
}

const main=async()=>{
    console.log(`当前时间是：${new Date()}`);
    
    //循环获取数量
    // const shuffled_PrivateKeys=NewPrivatKeys(privateKeys);
    for (let index = 37; index < 400; index++) {//PrivateKeys$18Wallets.length  shuffled_PrivateKeys.length
        // const morphl2_wallet=new ethers.Wallet(privateKeys[index].privateKey,morphl2_Provider);
        const address=wallet_create[index].address;
        console.log(`第${index+1}个钱包，钱包地址是:${address}`);
        await claimMOCKToken(address);
    }
}
main()