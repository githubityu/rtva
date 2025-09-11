export default class AppUtils {
    static picCids = [
        "bafybeig2ftu7um2ptkfsj4x6lggpwzwj3noaeyfr4v55vpg2y6w7w3rroi",//鼠
        "bafybeibe6cuh5ambwkrt6eqn7wlhby4yh37rh6azj5kjf7hscmtkcsoleq",//牛
        "bafybeifatk5btjjefmbnvzdoiitbrkf5bjsuggteuw6ikcxfswpj2exd6a",//虎
        "bafybeif5nyziddshkwdsxsuak44meqx3gbsfm6xkqzcd2jfvuzm3dwtrxm",//兔
        "bafybeicaflopyzi3ddxyqwg3dywqrn4a7auymbtfcr5gdf4pahvmohuzdm",//龙
        "bafybeidzfcyt6ifxabqoesbqdb5wzeo7npd2stdzybcwwkgwg6japht46e",//蛇
        "bafybeibh7jrv2bgtabl7w6nmknhaolrqgo33lrtw2eqdwx2vipr7jdtbnm",//马
        "bafybeihjeml4qglujyfar5aw5e65nlkcjwoxcf5e3xmrdushdurkbows54",//羊
        "bafybeifwnhk5ezpjdlflpxew7py35tl6weyzeefmsyfj6p2xgudsuc7ukm",//猴
        "bafybeidukxzz63nqueizxlrbebquqpd5fnz7y6thqr26eliot552n2ejva",//鸡
        "bafybeigoallkdkw7mk5ztz2blhdsw2dm2gu7h34qa6desq27vbhp77sxvi",//狗
        "bafybeihlqqnwdsdjvvyrx22whcuzsrui224pnajd3izkvjftb6vdnwefvy",//猪
    ]

    static getPicById(id: number): string {
        const cid = AppUtils.picCids[id]
        return  `https://ipfs.cddao.com/ipfs/${cid}`
        // return `https://${cid}.ipfs.dweb.link`
    }

}
