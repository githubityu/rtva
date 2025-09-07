export default class AppUtils {
    static picCids = [
        "Qmd2KJvQaarbgiofYUECyKduHJvYdgEAEQ9ZBaLGJZg92Z",//鼠
        "QmQprE4RUeAcZkVCGVNABsKnrsBiRtFsXBdiJ69NZMhg51",//牛
        "QmZ9anLXGNeigbSAW3LcEr4FmMPWZT9BUwZoHvijkq8HHR",//虎
        "Qmb67Duxc1iKrvpre14fgWUkoSS4qDosb6KFprb4bPagy8",//兔
        "QmSf8iAspWUf8vPMtxdT6eFg7oeqhzQWytGs62fG1f1geW",//龙
        "QmWVc2fWPd2FRTEbiDcf9QJ216rwHF2rhqo7pBPCHUBnjS",//蛇
        "QmR2i46t7gttEN9kKcnb1sr47RUWn3zxQUA9aem9LyBpNW",//马
        "Qme2ijqmeh1THmZ5HrjN6UQvRkRGWk9mgzmk8MzvaAAy4A",//羊
        "QmaciWdo7iLoxw2PqCUNAtGC9b1q228JCtHzqcPDWUkphY",//猴
        "QmWAn22fq8gAwhEYNDXsq88KfzhpjLxbJsDLVNgfnHNbZy",//鸡
        "QmcCqCsoxhrESPS3bXUqyhAq9BqhsS38ikryJEFkS6yTxV",//狗
        "QmeC1MX3yxwJvrW7evXUHcdFhzVVcHAMhQgZuNUkvDqAHj",//猪
    ]

    static getPicById(id: number): string {
        const cid = AppUtils.picCids[id]
        return  `https://ipfs.cddao.com/ipfs/${cid}`
        // return `https://${cid}.ipfs.dweb.link`
    }

}
