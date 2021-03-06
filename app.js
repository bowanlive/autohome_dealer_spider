var request = require('request'),
    iconv = require('iconv-lite'),
    cheerio = require('cheerio'),
    async = require("async"),
    fs = require('fs'),
    mysql = require('mysql');

var area = {"HotCites":[{"Id":110100,"Name":"北京","Pinyin":"beijing","Count":652},{"Id":310100,"Name":"上海","Pinyin":"shanghai","Count":617},{"Id":320100,"Name":"南京","Pinyin":"nanjing","Count":235},{"Id":330100,"Name":"杭州","Pinyin":"hangzhou","Count":341},{"Id":440100,"Name":"广州","Pinyin":"guangzhou","Count":470},{"Id":440300,"Name":"深圳","Pinyin":"shenzhen","Count":400}],"AreaInfoGroups":[{"Key":"","Values":[{"Id":110000,"Name":"北京","Pinyin":"beijing","Count":652,"FirstChar":"","Cities":[{"Id":110100,"Name":"北京","Pinyin":"beijing","Count":652}]},{"Id":120000,"Name":"天津","Pinyin":"tianjin","Count":318,"FirstChar":"","Cities":[{"Id":120100,"Name":"天津","Pinyin":"tianjin","Count":318}]},{"Id":310000,"Name":"上海","Pinyin":"shanghai","Count":617,"FirstChar":"","Cities":[{"Id":310100,"Name":"上海","Pinyin":"shanghai","Count":617}]},{"Id":500000,"Name":"重庆","Pinyin":"chongqing","Count":459,"FirstChar":"","Cities":[{"Id":500100,"Name":"重庆","Pinyin":"chongqing","Count":459}]}]},{"Key":"A","Values":[{"Id":340000,"Name":"安徽","Pinyin":"anhui","Count":963,"FirstChar":"A","Cities":[{"Id":340100,"Name":"合肥","Pinyin":"hefei","Count":233},{"Id":340200,"Name":"芜湖","Pinyin":"wuhu","Count":65},{"Id":340300,"Name":"蚌埠","Pinyin":"bangbu","Count":57},{"Id":340400,"Name":"淮南","Pinyin":"huainan","Count":36},{"Id":340500,"Name":"马鞍山","Pinyin":"maanshan","Count":50},{"Id":340600,"Name":"淮北","Pinyin":"huaibei","Count":40},{"Id":340700,"Name":"铜陵","Pinyin":"tongling","Count":30},{"Id":340800,"Name":"安庆","Pinyin":"anqing","Count":63},{"Id":341000,"Name":"黄山","Pinyin":"huangshan","Count":30},{"Id":341100,"Name":"滁州","Pinyin":"chuzhou","Count":33},{"Id":341200,"Name":"阜阳","Pinyin":"fu_yang","Count":88},{"Id":341300,"Name":"宿州","Pinyin":"su_zhou","Count":54},{"Id":341500,"Name":"六安","Pinyin":"liuan","Count":57},{"Id":341600,"Name":"亳州","Pinyin":"bozhou","Count":62},{"Id":341700,"Name":"池州","Pinyin":"chizhou","Count":20},{"Id":341800,"Name":"宣城","Pinyin":"xuancheng","Count":45}]},{"Id":820000,"Name":"澳门","Pinyin":"aomen","Count":0,"FirstChar":"A","Cities":[{"Id":820100,"Name":"澳门","Pinyin":"aomen","Count":0}]}]},{"Key":"F","Values":[{"Id":350000,"Name":"福建","Pinyin":"fujian","Count":806,"FirstChar":"F","Cities":[{"Id":350100,"Name":"福州","Pinyin":"fuzhou","Count":182},{"Id":350200,"Name":"厦门","Pinyin":"xiamen","Count":162},{"Id":350300,"Name":"莆田","Pinyin":"putian","Count":66},{"Id":350400,"Name":"三明","Pinyin":"sanming","Count":36},{"Id":350500,"Name":"泉州","Pinyin":"quanzhou","Count":181},{"Id":350600,"Name":"漳州","Pinyin":"zhangzhou","Count":72},{"Id":350700,"Name":"南平","Pinyin":"nanping","Count":29},{"Id":350800,"Name":"龙岩","Pinyin":"longyan","Count":53},{"Id":350900,"Name":"宁德","Pinyin":"ningde","Count":25}]}]},{"Key":"G","Values":[{"Id":440000,"Name":"广东","Pinyin":"guangdong","Count":2628,"FirstChar":"G","Cities":[{"Id":440100,"Name":"广州","Pinyin":"guangzhou","Count":470},{"Id":440200,"Name":"韶关","Pinyin":"shaoguan","Count":45},{"Id":440300,"Name":"深圳","Pinyin":"shenzhen","Count":400},{"Id":440400,"Name":"珠海","Pinyin":"zhuhai","Count":92},{"Id":440500,"Name":"汕头","Pinyin":"shantou","Count":78},{"Id":440600,"Name":"佛山","Pinyin":"foshan","Count":288},{"Id":440700,"Name":"江门","Pinyin":"jiangmen","Count":102},{"Id":440800,"Name":"湛江","Pinyin":"zhanjiang","Count":61},{"Id":440900,"Name":"茂名","Pinyin":"maoming","Count":58},{"Id":441200,"Name":"肇庆","Pinyin":"zhaoqing","Count":66},{"Id":441300,"Name":"惠州","Pinyin":"huizhou","Count":144},{"Id":441400,"Name":"梅州","Pinyin":"meizhou","Count":44},{"Id":441500,"Name":"汕尾","Pinyin":"shanwei","Count":21},{"Id":441600,"Name":"河源","Pinyin":"heyuan","Count":42},{"Id":441700,"Name":"阳江","Pinyin":"yangjiang","Count":34},{"Id":441800,"Name":"清远","Pinyin":"qingyuan","Count":67},{"Id":441900,"Name":"东莞","Pinyin":"dongguan","Count":357},{"Id":442000,"Name":"中山","Pinyin":"zhongshan","Count":137},{"Id":445100,"Name":"潮州","Pinyin":"chaozhou","Count":33},{"Id":445200,"Name":"揭阳","Pinyin":"jieyang","Count":59},{"Id":445300,"Name":"云浮","Pinyin":"yunfu","Count":30}]},{"Id":450000,"Name":"广西","Pinyin":"guangxi","Count":629,"FirstChar":"G","Cities":[{"Id":450100,"Name":"南宁","Pinyin":"nanning","Count":191},{"Id":450200,"Name":"柳州","Pinyin":"liuzhou","Count":84},{"Id":450300,"Name":"桂林","Pinyin":"guilin","Count":78},{"Id":450400,"Name":"梧州","Pinyin":"wuzhou","Count":27},{"Id":450500,"Name":"北海","Pinyin":"beihai","Count":29},{"Id":450600,"Name":"防城港","Pinyin":"fangchenggang","Count":6},{"Id":450700,"Name":"钦州","Pinyin":"qinzhou","Count":34},{"Id":450800,"Name":"贵港","Pinyin":"guigang","Count":31},{"Id":450900,"Name":"玉林","Pinyin":"yu_lin","Count":40},{"Id":451000,"Name":"百色","Pinyin":"baise","Count":46},{"Id":451100,"Name":"贺州","Pinyin":"hezhou","Count":16},{"Id":451200,"Name":"河池","Pinyin":"hechi","Count":30},{"Id":451300,"Name":"来宾","Pinyin":"laibin","Count":11},{"Id":451400,"Name":"崇左","Pinyin":"chongzuo","Count":6}]},{"Id":520000,"Name":"贵州","Pinyin":"guizhou","Count":659,"FirstChar":"G","Cities":[{"Id":520100,"Name":"贵阳","Pinyin":"guiyang","Count":194},{"Id":520200,"Name":"六盘水","Pinyin":"liupanshui","Count":50},{"Id":520300,"Name":"遵义","Pinyin":"zunyi","Count":111},{"Id":520400,"Name":"安顺","Pinyin":"anshun","Count":43},{"Id":520500,"Name":"毕节","Pinyin":"bijie","Count":52},{"Id":520600,"Name":"铜仁","Pinyin":"tongren","Count":51},{"Id":522300,"Name":"兴义市","Pinyin":"xingyishi","Count":62},{"Id":522600,"Name":"凯里","Pinyin":"kaili","Count":57},{"Id":522700,"Name":"都匀市","Pinyin":"duyunshi","Count":39}]},{"Id":620000,"Name":"甘肃","Pinyin":"gansu","Count":374,"FirstChar":"G","Cities":[{"Id":620100,"Name":"兰州","Pinyin":"lanzhou","Count":141},{"Id":620200,"Name":"嘉峪关","Pinyin":"jiayuguan","Count":9},{"Id":620300,"Name":"金昌","Pinyin":"jinchang","Count":7},{"Id":620400,"Name":"白银","Pinyin":"baiyin","Count":19},{"Id":620500,"Name":"天水","Pinyin":"tianshui","Count":30},{"Id":620600,"Name":"武威","Pinyin":"wuwei","Count":24},{"Id":620700,"Name":"张掖","Pinyin":"zhangye","Count":30},{"Id":620800,"Name":"平凉","Pinyin":"pingliang","Count":25},{"Id":620900,"Name":"酒泉","Pinyin":"jiuquan","Count":30},{"Id":621000,"Name":"庆阳","Pinyin":"qingyang","Count":33},{"Id":621100,"Name":"定西","Pinyin":"dingxi","Count":14},{"Id":621200,"Name":"陇南","Pinyin":"longnan","Count":3},{"Id":622900,"Name":"临夏","Pinyin":"linxia","Count":9},{"Id":623000,"Name":"甘南","Pinyin":"gannan","Count":0}]}]},{"Key":"H","Values":[{"Id":130000,"Name":"河北","Pinyin":"hebei","Count":1261,"FirstChar":"H","Cities":[{"Id":130100,"Name":"石家庄","Pinyin":"shijiazhuang","Count":209},{"Id":130200,"Name":"唐山","Pinyin":"tangshan","Count":144},{"Id":130300,"Name":"秦皇岛","Pinyin":"qinhuangdao","Count":57},{"Id":130400,"Name":"邯郸","Pinyin":"handan","Count":121},{"Id":130500,"Name":"邢台","Pinyin":"xingtai","Count":110},{"Id":130600,"Name":"保定","Pinyin":"baoding","Count":208},{"Id":130700,"Name":"张家口","Pinyin":"zhangjiakou","Count":64},{"Id":130800,"Name":"承德","Pinyin":"chengde","Count":41},{"Id":130900,"Name":"沧州","Pinyin":"cangzhou","Count":139},{"Id":131000,"Name":"廊坊","Pinyin":"langfang","Count":105},{"Id":131100,"Name":"衡水","Pinyin":"hengshui","Count":63}]},{"Id":230000,"Name":"黑龙江","Pinyin":"heilongjiang","Count":415,"FirstChar":"H","Cities":[{"Id":230100,"Name":"哈尔滨","Pinyin":"haerbin","Count":167},{"Id":230200,"Name":"齐齐哈尔","Pinyin":"qiqihaer","Count":49},{"Id":230300,"Name":"鸡西","Pinyin":"jixi","Count":4},{"Id":230400,"Name":"鹤岗","Pinyin":"hegang","Count":7},{"Id":230500,"Name":"双鸭山","Pinyin":"shuangyashan","Count":11},{"Id":230600,"Name":"大庆","Pinyin":"daqing","Count":52},{"Id":230700,"Name":"伊春","Pinyin":"yichun","Count":2},{"Id":230800,"Name":"佳木斯","Pinyin":"jiamusi","Count":46},{"Id":230900,"Name":"七台河","Pinyin":"qitaihe","Count":10},{"Id":231000,"Name":"牡丹江","Pinyin":"mudanjiang","Count":40},{"Id":231100,"Name":"黑河","Pinyin":"heihe","Count":5},{"Id":231200,"Name":"绥化","Pinyin":"suihua","Count":19},{"Id":232700,"Name":"大兴安岭","Pinyin":"daxinganling","Count":3}]},{"Id":410000,"Name":"河南","Pinyin":"henan","Count":1554,"FirstChar":"H","Cities":[{"Id":410100,"Name":"郑州","Pinyin":"zhengzhou","Count":359},{"Id":410200,"Name":"开封","Pinyin":"kaifeng","Count":63},{"Id":410300,"Name":"洛阳","Pinyin":"luoyang","Count":121},{"Id":410400,"Name":"平顶山","Pinyin":"pingdingshan","Count":66},{"Id":410500,"Name":"安阳","Pinyin":"anyang","Count":75},{"Id":410600,"Name":"鹤壁","Pinyin":"hebi","Count":22},{"Id":410700,"Name":"新乡","Pinyin":"xinxiang","Count":89},{"Id":410800,"Name":"焦作","Pinyin":"jiaozuo","Count":62},{"Id":410900,"Name":"濮阳","Pinyin":"puyang","Count":57},{"Id":411000,"Name":"许昌","Pinyin":"xuchang","Count":98},{"Id":411100,"Name":"漯河","Pinyin":"luohe","Count":53},{"Id":411200,"Name":"三门峡","Pinyin":"sanmenxia","Count":34},{"Id":411300,"Name":"南阳","Pinyin":"nanyang","Count":109},{"Id":411400,"Name":"商丘","Pinyin":"shangqiu","Count":101},{"Id":411500,"Name":"信阳","Pinyin":"xinyang","Count":76},{"Id":411600,"Name":"周口","Pinyin":"zhoukou","Count":77},{"Id":411700,"Name":"驻马店","Pinyin":"zhumadian","Count":78},{"Id":419001,"Name":"济源","Pinyin":"jiyuan","Count":14}]},{"Id":420000,"Name":"湖北","Pinyin":"hubei","Count":1009,"FirstChar":"H","Cities":[{"Id":420100,"Name":"武汉","Pinyin":"wuhan","Count":334},{"Id":420200,"Name":"黄石","Pinyin":"huangshi","Count":47},{"Id":420300,"Name":"十堰","Pinyin":"shiyan","Count":53},{"Id":420500,"Name":"宜昌","Pinyin":"yichang","Count":101},{"Id":420600,"Name":"襄阳","Pinyin":"xiangyang","Count":101},{"Id":420700,"Name":"鄂州","Pinyin":"ezhou","Count":5},{"Id":420800,"Name":"荆门","Pinyin":"jingmen","Count":43},{"Id":420900,"Name":"孝感","Pinyin":"xiaogan","Count":44},{"Id":421000,"Name":"荆州","Pinyin":"jingzhou","Count":58},{"Id":421100,"Name":"黄冈","Pinyin":"huanggang","Count":42},{"Id":421200,"Name":"咸宁","Pinyin":"xianning","Count":32},{"Id":421300,"Name":"随州","Pinyin":"suizhou","Count":43},{"Id":422800,"Name":"恩施","Pinyin":"enshi","Count":62},{"Id":429004,"Name":"仙桃","Pinyin":"xiantao","Count":11},{"Id":429005,"Name":"潜江","Pinyin":"qianjiang","Count":22},{"Id":429006,"Name":"天门","Pinyin":"tianmen","Count":11},{"Id":429021,"Name":"神农架","Pinyin":"shennongjia","Count":0}]},{"Id":430000,"Name":"湖南","Pinyin":"hunan","Count":1031,"FirstChar":"H","Cities":[{"Id":430100,"Name":"长沙","Pinyin":"changsha","Count":305},{"Id":430200,"Name":"株洲","Pinyin":"zhuzhou","Count":73},{"Id":430300,"Name":"湘潭","Pinyin":"xiangtan","Count":45},{"Id":430400,"Name":"衡阳","Pinyin":"hengyang","Count":76},{"Id":430500,"Name":"邵阳","Pinyin":"shaoyang","Count":54},{"Id":430600,"Name":"岳阳","Pinyin":"yueyang","Count":63},{"Id":430700,"Name":"常德","Pinyin":"changde","Count":76},{"Id":430800,"Name":"张家界","Pinyin":"zhangjiajie","Count":26},{"Id":430900,"Name":"益阳","Pinyin":"yiyang","Count":47},{"Id":431000,"Name":"郴州","Pinyin":"chenzhou","Count":66},{"Id":431100,"Name":"永州","Pinyin":"yongzhou","Count":49},{"Id":431200,"Name":"怀化","Pinyin":"huaihua","Count":63},{"Id":431300,"Name":"娄底","Pinyin":"loudi","Count":55},{"Id":433100,"Name":"湘西","Pinyin":"xiangxi","Count":33}]},{"Id":460000,"Name":"海南","Pinyin":"hainan","Count":146,"FirstChar":"H","Cities":[{"Id":460100,"Name":"海口","Pinyin":"haikou","Count":107},{"Id":460200,"Name":"三亚","Pinyin":"sanya","Count":35},{"Id":460300,"Name":"三沙市","Pinyin":"sanshashi","Count":0},{"Id":460400,"Name":"儋州","Pinyin":"danzhou","Count":1},{"Id":469001,"Name":"五指山","Pinyin":"wuzhishan","Count":0},{"Id":469002,"Name":"琼海","Pinyin":"qionghai","Count":3},{"Id":469005,"Name":"文昌","Pinyin":"wenchang","Count":0},{"Id":469006,"Name":"万宁","Pinyin":"wanning","Count":0},{"Id":469007,"Name":"东方","Pinyin":"dongfang","Count":0},{"Id":469021,"Name":"定安","Pinyin":"dingan","Count":0},{"Id":469022,"Name":"屯昌","Pinyin":"tunchang","Count":0},{"Id":469023,"Name":"澄迈","Pinyin":"chengmai","Count":0},{"Id":469024,"Name":"临高","Pinyin":"lingao","Count":0},{"Id":469025,"Name":"白沙","Pinyin":"baisha","Count":0},{"Id":469026,"Name":"昌江","Pinyin":"changjiang","Count":0},{"Id":469027,"Name":"乐东","Pinyin":"ledong","Count":0},{"Id":469028,"Name":"陵水","Pinyin":"lingshui","Count":0},{"Id":469029,"Name":"保亭","Pinyin":"baoting","Count":0},{"Id":469030,"Name":"琼中","Pinyin":"qiongzhong","Count":0}]}]},{"Key":"J","Values":[{"Id":220000,"Name":"吉林","Pinyin":"jilin","Count":405,"FirstChar":"J","Cities":[{"Id":220100,"Name":"长春","Pinyin":"changchun","Count":184},{"Id":220200,"Name":"吉林","Pinyin":"jilinshi","Count":64},{"Id":220300,"Name":"四平","Pinyin":"siping","Count":20},{"Id":220400,"Name":"辽源","Pinyin":"liaoyuan","Count":7},{"Id":220500,"Name":"通化","Pinyin":"tonghua","Count":27},{"Id":220600,"Name":"白山","Pinyin":"baishan","Count":7},{"Id":220700,"Name":"松原","Pinyin":"songyuan","Count":38},{"Id":220800,"Name":"白城","Pinyin":"baicheng","Count":17},{"Id":222400,"Name":"延边","Pinyin":"yanbian","Count":41}]},{"Id":320000,"Name":"江苏","Pinyin":"jiangsu","Count":2062,"FirstChar":"J","Cities":[{"Id":320100,"Name":"南京","Pinyin":"nanjing","Count":235},{"Id":320200,"Name":"无锡","Pinyin":"wuxi","Count":233},{"Id":320300,"Name":"徐州","Pinyin":"xuzhou","Count":133},{"Id":320400,"Name":"常州","Pinyin":"changzhou","Count":150},{"Id":320500,"Name":"苏州","Pinyin":"suzhou","Count":448},{"Id":320600,"Name":"南通","Pinyin":"nantong","Count":209},{"Id":320700,"Name":"连云港","Pinyin":"lianyungang","Count":79},{"Id":320800,"Name":"淮安","Pinyin":"huaian","Count":74},{"Id":320900,"Name":"盐城","Pinyin":"yancheng","Count":121},{"Id":321000,"Name":"扬州","Pinyin":"yangzhou","Count":91},{"Id":321100,"Name":"镇江","Pinyin":"zhenjiang","Count":89},{"Id":321200,"Name":"泰州","Pinyin":"tai_zhou","Count":116},{"Id":321300,"Name":"宿迁","Pinyin":"suqian","Count":84}]},{"Id":360000,"Name":"江西","Pinyin":"jiangxi","Count":628,"FirstChar":"J","Cities":[{"Id":360100,"Name":"南昌","Pinyin":"nanchang","Count":153},{"Id":360200,"Name":"景德镇","Pinyin":"jingdezhen","Count":23},{"Id":360300,"Name":"萍乡","Pinyin":"ping_xiang","Count":28},{"Id":360400,"Name":"九江","Pinyin":"jiujiang","Count":65},{"Id":360500,"Name":"新余","Pinyin":"xinyu","Count":24},{"Id":360600,"Name":"鹰潭","Pinyin":"yingtan","Count":15},{"Id":360700,"Name":"赣州","Pinyin":"ganzhou","Count":100},{"Id":360800,"Name":"吉安","Pinyin":"jian","Count":51},{"Id":360900,"Name":"宜春","Pinyin":"yi_chun","Count":67},{"Id":361000,"Name":"抚州","Pinyin":"fu_zhou","Count":37},{"Id":361100,"Name":"上饶","Pinyin":"shangrao","Count":65}]}]},{"Key":"L","Values":[{"Id":210000,"Name":"辽宁","Pinyin":"liaoning","Count":740,"FirstChar":"L","Cities":[{"Id":210100,"Name":"沈阳","Pinyin":"shenyang","Count":193},{"Id":210200,"Name":"大连","Pinyin":"dalian","Count":158},{"Id":210300,"Name":"鞍山","Pinyin":"anshan","Count":58},{"Id":210400,"Name":"抚顺","Pinyin":"fushun","Count":29},{"Id":210500,"Name":"本溪","Pinyin":"benxi","Count":19},{"Id":210600,"Name":"丹东","Pinyin":"dandong","Count":24},{"Id":210700,"Name":"锦州","Pinyin":"jinzhou","Count":35},{"Id":210800,"Name":"营口","Pinyin":"yingkou","Count":37},{"Id":210900,"Name":"阜新","Pinyin":"fuxin","Count":29},{"Id":211000,"Name":"辽阳","Pinyin":"liaoyang","Count":26},{"Id":211100,"Name":"盘锦","Pinyin":"panjin","Count":37},{"Id":211200,"Name":"铁岭","Pinyin":"tieling","Count":21},{"Id":211300,"Name":"朝阳","Pinyin":"chaoyang","Count":39},{"Id":211400,"Name":"葫芦岛","Pinyin":"huludao","Count":35}]}]},{"Key":"N","Values":[{"Id":150000,"Name":"内蒙古","Pinyin":"namenggu","Count":466,"FirstChar":"N","Cities":[{"Id":150100,"Name":"呼和浩特","Pinyin":"huhehaote","Count":105},{"Id":150200,"Name":"包头","Pinyin":"baotou","Count":70},{"Id":150300,"Name":"乌海","Pinyin":"wuhai","Count":21},{"Id":150400,"Name":"赤峰","Pinyin":"chifeng","Count":66},{"Id":150500,"Name":"通辽","Pinyin":"tongliao","Count":40},{"Id":150600,"Name":"鄂尔多斯","Pinyin":"eerduosi","Count":61},{"Id":150700,"Name":"呼伦贝尔","Pinyin":"hulunbeier","Count":30},{"Id":150800,"Name":"巴彦淖尔","Pinyin":"bayannaoer","Count":28},{"Id":150900,"Name":"乌兰察布","Pinyin":"wulanchabu","Count":16},{"Id":152200,"Name":"兴安盟","Pinyin":"xinganmeng","Count":16},{"Id":152500,"Name":"锡林郭勒盟","Pinyin":"xilinguolemeng","Count":13},{"Id":152900,"Name":"阿拉善盟","Pinyin":"alashanmeng","Count":0}]},{"Id":640000,"Name":"宁夏","Pinyin":"ningxia","Count":128,"FirstChar":"N","Cities":[{"Id":640100,"Name":"银川","Pinyin":"yinchuan","Count":108},{"Id":640200,"Name":"石嘴山","Pinyin":"shizuishan","Count":4},{"Id":640300,"Name":"吴忠","Pinyin":"wuzhong","Count":10},{"Id":640400,"Name":"固原","Pinyin":"guyuan","Count":6},{"Id":640500,"Name":"中卫","Pinyin":"zhongwei","Count":0}]}]},{"Key":"Q","Values":[{"Id":630000,"Name":"青海","Pinyin":"qinghai","Count":100,"FirstChar":"Q","Cities":[{"Id":630100,"Name":"西宁","Pinyin":"xining","Count":96},{"Id":630200,"Name":"海东","Pinyin":"haidong","Count":3},{"Id":632200,"Name":"海北","Pinyin":"haibei","Count":0},{"Id":632300,"Name":"黄南","Pinyin":"huangnan","Count":0},{"Id":632500,"Name":"海南","Pinyin":"hai_nan","Count":0},{"Id":632600,"Name":"果洛","Pinyin":"guoluo","Count":0},{"Id":632700,"Name":"玉树","Pinyin":"yushu","Count":0},{"Id":632800,"Name":"海西","Pinyin":"haixi","Count":1}]}]},{"Key":"S","Values":[{"Id":140000,"Name":"山西","Pinyin":"shanxi","Count":564,"FirstChar":"S","Cities":[{"Id":140100,"Name":"太原","Pinyin":"taiyuan","Count":163},{"Id":140200,"Name":"大同","Pinyin":"datong","Count":57},{"Id":140300,"Name":"阳泉","Pinyin":"yangquan","Count":24},{"Id":140400,"Name":"长治","Pinyin":"changzhi","Count":57},{"Id":140500,"Name":"晋城","Pinyin":"jincheng","Count":37},{"Id":140600,"Name":"朔州","Pinyin":"shuozhou","Count":16},{"Id":140700,"Name":"晋中","Pinyin":"jinzhong","Count":43},{"Id":140800,"Name":"运城","Pinyin":"yuncheng","Count":73},{"Id":140900,"Name":"忻州","Pinyin":"xinzhou","Count":18},{"Id":141000,"Name":"临汾","Pinyin":"linfen","Count":52},{"Id":141100,"Name":"吕梁","Pinyin":"lvliang","Count":24}]},{"Id":370000,"Name":"山东","Pinyin":"shandong","Count":1986,"FirstChar":"S","Cities":[{"Id":370100,"Name":"济南","Pinyin":"jinan","Count":216},{"Id":370200,"Name":"青岛","Pinyin":"qingdao","Count":287},{"Id":370300,"Name":"淄博","Pinyin":"zibo","Count":117},{"Id":370400,"Name":"枣庄","Pinyin":"zaozhuang","Count":66},{"Id":370500,"Name":"东营","Pinyin":"dongying","Count":59},{"Id":370600,"Name":"烟台","Pinyin":"yantai","Count":151},{"Id":370700,"Name":"潍坊","Pinyin":"weifang","Count":188},{"Id":370800,"Name":"济宁","Pinyin":"jining","Count":145},{"Id":370900,"Name":"泰安","Pinyin":"taian","Count":86},{"Id":371000,"Name":"威海","Pinyin":"weihai","Count":80},{"Id":371100,"Name":"日照","Pinyin":"rizhao","Count":57},{"Id":371200,"Name":"莱芜","Pinyin":"laiwu","Count":22},{"Id":371300,"Name":"临沂","Pinyin":"linyi","Count":161},{"Id":371400,"Name":"德州","Pinyin":"dezhou","Count":80},{"Id":371500,"Name":"聊城","Pinyin":"liaocheng","Count":77},{"Id":371600,"Name":"滨州","Pinyin":"binzhou","Count":74},{"Id":371700,"Name":"菏泽","Pinyin":"heze","Count":120}]},{"Id":510000,"Name":"四川","Pinyin":"sichuan","Count":1457,"FirstChar":"S","Cities":[{"Id":510100,"Name":"成都","Pinyin":"chengdu","Count":486},{"Id":510300,"Name":"自贡","Pinyin":"zigong","Count":46},{"Id":510400,"Name":"攀枝花","Pinyin":"panzhihua","Count":30},{"Id":510500,"Name":"泸州","Pinyin":"luzhou","Count":75},{"Id":510600,"Name":"德阳","Pinyin":"deyang","Count":70},{"Id":510700,"Name":"绵阳","Pinyin":"mianyang","Count":102},{"Id":510800,"Name":"广元","Pinyin":"guangyuan","Count":50},{"Id":510900,"Name":"遂宁","Pinyin":"suining","Count":49},{"Id":511000,"Name":"内江","Pinyin":"neijiang","Count":33},{"Id":511100,"Name":"乐山","Pinyin":"leshan","Count":60},{"Id":511300,"Name":"南充","Pinyin":"nanchong","Count":86},{"Id":511400,"Name":"眉山","Pinyin":"meishan","Count":54},{"Id":511500,"Name":"宜宾","Pinyin":"yibin","Count":70},{"Id":511600,"Name":"广安","Pinyin":"guangan","Count":38},{"Id":511700,"Name":"达州","Pinyin":"dazhou","Count":65},{"Id":511800,"Name":"雅安","Pinyin":"yaan","Count":24},{"Id":511900,"Name":"巴中","Pinyin":"bazhong","Count":50},{"Id":512000,"Name":"资阳","Pinyin":"ziyang","Count":34},{"Id":513200,"Name":"阿坝","Pinyin":"aba","Count":0},{"Id":513300,"Name":"甘孜","Pinyin":"ganzi","Count":0},{"Id":513400,"Name":"凉山","Pinyin":"liangshan","Count":35}]},{"Id":610000,"Name":"陕西","Pinyin":"shan_xi","Count":625,"FirstChar":"S","Cities":[{"Id":610100,"Name":"西安","Pinyin":"xian","Count":282},{"Id":610200,"Name":"铜川","Pinyin":"tongchuan","Count":5},{"Id":610300,"Name":"宝鸡","Pinyin":"baoji","Count":55},{"Id":610400,"Name":"咸阳","Pinyin":"xianyang","Count":56},{"Id":610500,"Name":"渭南","Pinyin":"weinan","Count":53},{"Id":610600,"Name":"延安","Pinyin":"yanan","Count":39},{"Id":610700,"Name":"汉中","Pinyin":"hanzhong","Count":52},{"Id":610800,"Name":"榆林","Pinyin":"yulin","Count":58},{"Id":610900,"Name":"安康","Pinyin":"ankang","Count":20},{"Id":611000,"Name":"商洛","Pinyin":"shangluo","Count":5}]}]},{"Key":"T","Values":[{"Id":710000,"Name":"台湾","Pinyin":"taiwan","Count":0,"FirstChar":"T","Cities":[{"Id":710100,"Name":"台湾","Pinyin":"taiwan","Count":0}]}]},{"Key":"X","Values":[{"Id":540000,"Name":"西藏","Pinyin":"xizang","Count":25,"FirstChar":"X","Cities":[{"Id":540100,"Name":"拉萨","Pinyin":"lasa","Count":25},{"Id":540200,"Name":"日喀则","Pinyin":"rikaze","Count":0},{"Id":540300,"Name":"昌都","Pinyin":"changdou","Count":0},{"Id":540400,"Name":"林芝","Pinyin":"linzhi","Count":0},{"Id":540500,"Name":"山南","Pinyin":"shannan","Count":0},{"Id":542400,"Name":"那曲","Pinyin":"naqu","Count":0},{"Id":542500,"Name":"阿里","Pinyin":"ali","Count":0}]},{"Id":650000,"Name":"新疆","Pinyin":"xinjiang","Count":417,"FirstChar":"X","Cities":[{"Id":650100,"Name":"乌鲁木齐","Pinyin":"wulumuqi","Count":161},{"Id":650200,"Name":"克拉玛依","Pinyin":"kelamayi","Count":13},{"Id":650400,"Name":"吐鲁番","Pinyin":"tulufan","Count":0},{"Id":650500,"Name":"哈密","Pinyin":"hami","Count":14},{"Id":652300,"Name":"昌吉","Pinyin":"changji","Count":26},{"Id":652700,"Name":"博尔塔拉","Pinyin":"boertala","Count":1},{"Id":652800,"Name":"巴音郭楞","Pinyin":"bayinguoleng","Count":39},{"Id":652900,"Name":"阿克苏","Pinyin":"akesu","Count":55},{"Id":653000,"Name":"克孜勒苏","Pinyin":"kezilesu","Count":0},{"Id":653100,"Name":"喀什","Pinyin":"kashen","Count":37},{"Id":653200,"Name":"和田","Pinyin":"hetian","Count":4},{"Id":654000,"Name":"伊犁","Pinyin":"yili","Count":50},{"Id":654200,"Name":"塔城","Pinyin":"tacheng","Count":0},{"Id":654300,"Name":"阿勒泰","Pinyin":"aletai","Count":8},{"Id":659001,"Name":"石河子","Pinyin":"shihezi","Count":9},{"Id":659002,"Name":"阿拉尔","Pinyin":"alaer","Count":0},{"Id":659003,"Name":"图木舒克","Pinyin":"tumushuke","Count":0},{"Id":659004,"Name":"五家渠","Pinyin":"wujiaqu","Count":0},{"Id":659005,"Name":"北屯市","Pinyin":"beitunshi","Count":0},{"Id":659006,"Name":"铁门关市","Pinyin":"tiemenguanshi","Count":0},{"Id":659007,"Name":"双河市","Pinyin":"shuangheshi","Count":0},{"Id":659008,"Name":"可克达拉市","Pinyin":"kekedalashi","Count":0},{"Id":659009,"Name":"昆玉","Pinyin":"kunyu","Count":0}]},{"Id":810000,"Name":"香港","Pinyin":"xianggang","Count":0,"FirstChar":"X","Cities":[{"Id":810100,"Name":"香港","Pinyin":"xianggang","Count":0}]}]},{"Key":"Y","Values":[{"Id":530000,"Name":"云南","Pinyin":"yunnan","Count":762,"FirstChar":"Y","Cities":[{"Id":530100,"Name":"昆明","Pinyin":"kunming","Count":245},{"Id":530300,"Name":"曲靖","Pinyin":"qujing","Count":77},{"Id":530400,"Name":"玉溪","Pinyin":"yuxi","Count":51},{"Id":530500,"Name":"保山","Pinyin":"baoshan","Count":40},{"Id":530600,"Name":"昭通","Pinyin":"zhaotong","Count":37},{"Id":530700,"Name":"丽江","Pinyin":"lijiang","Count":22},{"Id":530800,"Name":"普洱","Pinyin":"puer","Count":35},{"Id":530900,"Name":"临沧","Pinyin":"lincang","Count":20},{"Id":532300,"Name":"楚雄","Pinyin":"chuxiong","Count":33},{"Id":532500,"Name":"红河","Pinyin":"honghe","Count":59},{"Id":532600,"Name":"文山","Pinyin":"wenshan","Count":43},{"Id":532800,"Name":"西双版纳","Pinyin":"xishuangbanna","Count":22},{"Id":532900,"Name":"大理","Pinyin":"dali","Count":59},{"Id":533100,"Name":"德宏","Pinyin":"dehong","Count":19},{"Id":533300,"Name":"怒江","Pinyin":"nujiang","Count":0},{"Id":533400,"Name":"迪庆","Pinyin":"diqing","Count":0}]}]},{"Key":"Z","Values":[{"Id":330000,"Name":"浙江","Pinyin":"zhejiang","Count":1821,"FirstChar":"Z","Cities":[{"Id":330100,"Name":"杭州","Pinyin":"hangzhou","Count":341},{"Id":330200,"Name":"宁波","Pinyin":"ningbo","Count":303},{"Id":330300,"Name":"温州","Pinyin":"wenzhou","Count":241},{"Id":330400,"Name":"嘉兴","Pinyin":"jiaxing","Count":149},{"Id":330500,"Name":"湖州","Pinyin":"huzhou","Count":105},{"Id":330600,"Name":"绍兴","Pinyin":"shaoxing","Count":170},{"Id":330700,"Name":"金华","Pinyin":"jinhua","Count":222},{"Id":330800,"Name":"衢州","Pinyin":"quzhou","Count":49},{"Id":330900,"Name":"舟山","Pinyin":"zhoushan","Count":25},{"Id":331000,"Name":"台州","Pinyin":"taizhou","Count":174},{"Id":331100,"Name":"丽水","Pinyin":"lishui","Count":42}]}]}],"ProvinceId":0,"CityId":469002,"FirstLetter":"H"};

var autohome_dealer_url = "https://dealer.autohome.com.cn/{city}/0/0/0/0/{page}/0/0/0.html";

var cityDealerInitUrls = [];
var cityDealerAllUrls = [];
var cityDealers = [];

var fetchCityDealerMaxPageCounter = 0;
var fetchCityDealerCounter = 0;
var fetchCityDealerSeriesCounter = 0;

var threads = 8;

var fetchProvinceNames = [
    // "北京", "天津", "上海", "重庆"
    // "安徽", "福建", "广东", "广西"
    // , "贵州", "甘肃", "河北", "黑龙江"
    // , "河南", "湖北", "湖南", "海南"
    // , "吉林", "江苏", "江西", "辽宁"
    // , "内蒙古", "宁夏", "青海", "山西"
    "山东", "四川", "陕西", "西藏"
    , "新疆", "云南", "浙江"
];

function app() {

    console.log("开始抓取数据");
    
    async.mapLimit(fetchProvinceNames, 1, function (fetchProvinceName, callback) {
        if (fetchProvinceName != undefined)
            fetchProvince(fetchProvinceName, callback);
    }, function (err, result) {
        console.log("完成抓取数据");
    });
}

function fetchProvince(fetchProvinceName, callback) {
    cityDealerInitUrls = [];
    cityDealerAllUrls = [];
    cityDealers = [];

    fetchCityDealerMaxPageCounter = 0;
    fetchCityDealerCounter = 0;
    fetchCityDealerSeriesCounter = 0;

    console.log("开始抓取【" + fetchProvinceName + "】经销商数据");
    console.log("开始生成各个城市经销商列表初始 Url...");
    generateCityDealerInitUrls(fetchProvinceName);
    console.log("完成生成各个城市经销商列表初始 Url");

    console.log("开始抓取各个城市经销商列表总页数...");

    async.mapLimit(cityDealerInitUrls, threads, function (cityDealerInitUrl, callback) {
        fetchCityDealerMaxPageCounter++;
        console.log(fetchCityDealerMaxPageCounter + "/" + cityDealerInitUrls.length);
        fetchCityDealerMaxPage(cityDealerInitUrl, callback);
    }, function (err, result) {
        console.log("完成抓取各个城市经销商列表总页数");

        console.log("开始生成各个城市经销商列表每页 Url...");
        generateCityDealerAllUrls();
        console.log("完成生成各个城市经销商列表每页 Url");

        console.log("开始抓取经销商数据...");
        async.mapLimit(cityDealerAllUrls, threads, function (cityDealerUrl, callback) {
            fetchCityDealerCounter++;
            console.log(fetchCityDealerCounter + "/" + cityDealerAllUrls.length);
            fetchCityDealer(cityDealerUrl, callback);
        }, function (err, result) {
            console.log("完成抓取经销商数据");

            console.log("开始抓取经销商关联车系数据...");
            async.mapLimit(cityDealers, threads, function (cityDealer, callback) {
                fetchCityDealerSeriesCounter++;
                console.log(fetchCityDealerSeriesCounter + "/" + cityDealers.length);
                fetchCityDealerSeries(cityDealer, callback);
            }, function (err, result) {
                console.log("完成抓取经销商关联车系数据");
                saveDataToFile(fetchProvinceName);
                console.log("完成抓取【" + fetchProvinceName + "】经销商数据");
                callback();
            });
        });
    });
}

function generateCityDealerInitUrls(fetchProvinceName) {
    for (let i = 0; i < area.AreaInfoGroups.length; i++) {
        const group = area.AreaInfoGroups[i];

        // 直辖市
        if (group.Key == "") {
            
            for (let j = 0; j < group.Values.length; j++) {
                const city = group.Values[j];

                if (city.Name != fetchProvinceName)
                    continue;
                
                url = autohome_dealer_url.replace("{city}", city.Pinyin).replace("{page}", "0");
                
                cityDealerInitUrls.push({ Id: city.Id, Name: city.Name, Pinyin: city.Pinyin, url:  url});
            }

        } else {

            for (let j = 0; j < group.Values.length; j++) {
                const province = group.Values[j];

                if (province.Name != fetchProvinceName)
                    continue;
                
                for (let k = 0; k < province.Cities.length; k++) {
                    const city = province.Cities[k];
                
                    url = autohome_dealer_url.replace("{city}", city.Pinyin).replace("{page}", "0");
                    
                    cityDealerInitUrls.push({ Id: city.Id, Name: city.Name, Pinyin: city.Pinyin, url:  url});
                }
            }

        }
    }
}

function fetchCityDealerMaxPage(cityUrl, callback) {
    request({
        url: cityUrl.url,
        encoding: null
    }, function (err, res, body) {
        let bodyHtml = iconv.decode(body, "gb2312");
        let startIndex = bodyHtml.indexOf("var dealerCount = ");
        let endIndex = bodyHtml.indexOf(";", startIndex);
        let count = Number(bodyHtml.substring(startIndex + 18, endIndex));

        cityUrl.page = count;

        callback();
    });
}

function generateCityDealerAllUrls() {
    for (let i = 0; i < cityDealerInitUrls.length; i++) {
        const cityDealerInitUrl = cityDealerInitUrls[i];

        for (let j = 0; j < cityDealerInitUrl.page; j++) {
            let url = autohome_dealer_url.replace("{city}", cityDealerInitUrl.Pinyin).replace("{page}", j);

            cityDealerAllUrls.push({ Id: cityDealerInitUrl.Id, Name: cityDealerInitUrl.Name, Pinyin: cityDealerInitUrl.Pinyin, url:  url});
        }
    }
}

function fetchCityDealer(cityDealerUrl, callback) {
    request({
        url: cityDealerUrl.url,
        encoding: null
    }, function (err, res, body) {
        let bodyHtml = iconv.decode(body, "gb2312");
        let $ = cheerio.load(bodyHtml);
        let listItems = $(".list-item");

        for (let i = 0; i < listItems.length; i++) {
            let dealerName = listItems.eq(i).find(".tit-row a span").text();
            let dealerUrl = listItems.eq(i).find(".tit-row a").attr("href");

            cityDealers.push({
                cityId: cityDealerUrl.Id,
                cityName: cityDealerUrl.Name,
                cityPinyin: cityDealerUrl.Pinyin,
                dealerName: dealerName,
                dealerUrl: dealerUrl
            });
        }

        callback();
    });
}

function fetchCityDealerSeries(cityDealer, callback) {
    request({
        url: "http:" + cityDealer.dealerUrl,
        encoding: null
    }, function (err, res, body) {
        let bodyHtml = iconv.decode(body, "gb2312");
        let $ = cheerio.load(bodyHtml);
        let series = $(".brandtree .brandtree-cont dl dd a");

        cityDealer.series = [];

        for (let i = 0; i < series.length; i++) {
            let seriesUrl = series.eq(i).attr("href");
            let seriesName = series.eq(i).text();
            let index1 = seriesUrl.indexOf("_");
            let index2 = seriesUrl.indexOf(".");
            let seriesId = seriesUrl.substring(index1 + 1, index2);

            cityDealer.series.push({
                id: seriesId,
                name: seriesName
            });
        }

        callback();
    });
}

function saveDataToFile(fetchProvinceName) {
    var province = { Name: fetchProvinceName, count: cityDealers.length, dealers: cityDealers };
    var json = JSON.stringify(province);
    fs.writeFileSync(fetchProvinceName + ".json", json);
    console.log("数据已成功保存到文件。");
}

/*
function saveDataToMySQL() {
    let values = [];

    for (let i = 0; i < data.length; i++) {
        let item = data[i];

        values.push([item.groupName, item.brandName, item.factoryName, item.seriesId, item.seriesName, item.price,
            arrayToString(item.JB), arrayToString(item.PL), arrayToString(item.QD), arrayToString(item.NY), arrayToString(item.BSX), arrayToString(item.GB), arrayToString(item.SCFS), arrayToString(item.JG), arrayToString(item.ZW)]);
    }

    let connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'kaiba'
    });

    connection.connect();

    let sql = "insert into autohome(`group`, `brand`, `factory`, `series_id`, `series`, `price`, `jb`, `pl`, `qd`, `ny`, `bsx`, `gb`, `scfs`, `jg`, `zw`) values ?";

    connection.query(sql, [values], function (err, rows, fields) {
        if (err) {
            console.log("数据保存到数据库失败！");
            console.log("错误信息：");
            console.log(err.message);
        } else {
            console.log("数据成功保存到数据库。");
        }            
    });

    connection.end();
}
*/

app();