export default class AppUtils {
    static picCids = [
        "bafybeifofpcpyennmwixgekwpwdakxa4tw7ucsfy2yi6u6z4vm23mzbidy",//鼠
        "bafybeiajk5bckviubqkmp3dkppr4u2676vub6or4v3sxm5slvjnxvop5qu",//牛
        "bafybeiglv5w7bndlpfccomgujhbdrxljdrwh6bmqfkmbf4uviw4grr3vda",//虎
        "bafybeiejxuv62vd77bulplr27rygqfqn4tpe4ypfhg3dys2tubog4kpx44",//兔
        "bafybeignz2sq2npefmkc5l5jvqoihqf6hjv4qe7t7ivwl4bzlwmdvlhezm",//龙
        "bafybeifmizallyvlxoyzju6hsl4pqlgzr5nt4vvtrhtkcbrtcargxtmypu",//蛇
        "bafybeig2fo6fm6boaiqlc6ifv7mmg3jdcewyhctzjomizfqpysoqjvzm5q",//马
        "bafybeieyjrkdr53r53syynruwzgdty3rabceur6c5aid4ga3kxodjc6b2q",//羊
        "bafybeibkxhzj7fa4r5apzwdzu64n6c6bx27mbjcbgjvsenw3hhusysgk64",//猴
        "bafybeihralqqlrq3f7dwzoo6m7ws4rph4eetecwl3bn3mtk4tuuwp7bdsy",//鸡
        "bafybeiaas24y4dbhf4dj3w7gjngmwdaqsbrzunc4q6coi5nfd4wc47j2sq",//狗
        "bafybeiardjp4uxdhehwv3sysmlhtac3s3hujtgr2pd4ylp277f5js3f62e",//猪
    ]

    static getPicById(id: number): string {
        const cid = AppUtils.picCids[id]
        return `https://${cid}.ipfs.dweb.link`
    }

}
