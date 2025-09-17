export default class AppUtils {
    //7 bafkreicxsni3jnun2g5xf4mbmqqihnm5h4jdftzcerh2mj5f5dqganmymy

    static picCids = [
        "bafkreigxhzl2anozhfezcejdjipkv6x6tne6obosmoihcvsis2lfeixsyi",//宙斯
        "bafkreiduktovx7unf7bokvzxgrzda2hrgu3de7pynpszvfw762unlencda",//赫拉
        "bafkreibyuxwcz67dmbfdnyhgnmtptm23pczfr3twwrwh3cixpohbfdrhau",//波塞冬
        "bafkreigovgvreqjpxhu2kfchppbh2hmcdtbd775tndtsfhpk4c5nmh5b4a",//德墨忒尔
        "bafkreif4zn5ijeyhhz6ie2ctnb4u3ybrjptfgoco4capzoic5pd2w2nsua",//雅典娜
        "bafkreialxo2k2arwaulmwtgahhpuhum2jw3thqensx66mg6pofqygsysfq",//阿波罗
        "bafkreidns6zxngxnxwfhrx4cig7wenslytzhhjy6l4a7sotg256mocieqi",//阿尔忒弥斯
        "bafkreic6amxiq4e5g7iuf2i6j2i5yxxiorqpsa2cdz4mwwuv4325dpqepu",// 阿瑞斯
        "bafkreigf5rwrdb4k3gsdypwkewv7tx6hbmomj2yblli6wkwmr2oed2y2sa",//阿芙罗狄忒
        "bafkreicpymxdsgxbco4lgffaupipdvdlqpqtfkpipuy27hczzrzbedcrv4",//赫菲斯托斯
        "bafkreic3o6adbxbaau5wrbwtn5sj6uacsl6apoy6svizxewzmcqniawh5q",//赫尔墨斯
        "bafkreicxsni3jnun2g5xf4mbmqqihnm5h4jdftzcerh2mj5f5dqganmymy",//狄俄尼索斯
    ]

    static getPicById(id: number): string {
        const cid = AppUtils.picCids[id]
        return  `https://ipfs.cddao.com/ipfs/${cid}`
        // return `https://${cid}.ipfs.dweb.link`
    }

}
