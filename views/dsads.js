{
	header: {
		"code": -100,
		"message": {
			"title": "",
			"detail": ""
		}
	},
	body: {
		dataStores: {
			kccjStore: {
				rowSet: {
					"primary": [],
					"filter": [],
					"delete": []
				},
				name: "kccjStore",
				pageNumber: 1,
				pageSize: 10,
				recordCount: 2,
				rowSetName: "pojo_com.neusoft.education.sysu.xscj.xscjcx.model.KccjModel",
				order: "t.xn, t.xq, t.kch, t.bzw"
			}
		},
		parameters: {
			"kccjStore-params": [{
				"name": "Filter_t.pylbm_0.9531654468488477",
				"type": "String",
				"value": "'01'",
				"condition": " = ",
				"property": "t.pylbm"
			}, {
				"name": "Filter_t.xn_0.15328013404955903",
				"type": "String",
				"value": "'2014-2015'",
				"condition": " = ",
				"property": "t.xn"
			}, {
				"name": "Filter_t.xq_0.4813181894043718",
				"type": "String",
				"value": "'1'",
				"condition": " = ",
				"property": "t.xq"
			}, {
				"name": "kclb",
				"type": "String",
				"value": "('10','11','21','30')",
				"condition": " in ",
				"property": "t.kclb"
			}],
			"args": ["student"]
		}
	}
}