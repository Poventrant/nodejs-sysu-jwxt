var paths = {
    ENTRANCE: "http://uems.sysu.edu.cn/jwxt/",
    CAPTCHA: "http://uems.sysu.edu.cn/jwxt/jcaptcha",
    LOGIN: "http://uems.sysu.edu.cn/jwxt/j_unieap_security_check.do",
    MAIN: "http://uems.sysu.edu.cn/jwxt/edp/index.jsp",
    NAME: "http://uems.sysu.edu.cn/jwxt/edp/menu/RootMenu.jsp",
    SCORE: "http://uems.sysu.edu.cn/jwxt/forward.action?path=/sysu/xscj/xscjcx/xsgrcj",
    LOGOUT: "http://uems.sysu.edu.cn/jwxt/logout.jsp",
    ALLXN: "http://uems.sysu.edu.cn/jwxt/ria_codelist.do?category=SIS_DM_XNDM&method=loadCodeList",
    JUDGE: "http://uems.sysu.edu.cn/jwxt/xscjcxAction/xscjcxAction.action?method=judgeStu",
    ZYXF: "http://uems.sysu.edu.cn/jwxt/xscjcxAction/xscjcxAction.action?method=getZyxf", //主修专业毕业学分要求（红色为未达到要求）
    ALLXF: "http://uems.sysu.edu.cn/jwxt/xscjcxAction/xscjcxAction.action?method=getAllXf", //全部学年度学期完成情况--学分
    ALLJD: "http://uems.sysu.edu.cn/jwxt/xscjcxAction/xscjcxAction.action?method=getAllJd", //全部学年度学期完成情况--平均绩点
    KCCJLIST: "http://uems.sysu.edu.cn/jwxt/xscjcxAction/xscjcxAction.action?method=getKccjList",
    COUNTALL: "http://uems.sysu.edu.cn/jwxt/xscjcxAction/xscjcxAction.action?method=countXfJd",
    RKCLIST: "http://uems.sysu.edu.cn/jwxt/forward.action?path=/sysu/xscj/xscjcx/xsgrcj_list",
    RNAME: "http://uems.sysu.edu.cn/jwxt/edp/innerindex.jsp"
}

module.exports = paths;