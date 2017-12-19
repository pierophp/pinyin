import axios from 'axios';

axios.defaults.headers.common['User-Agent'] = 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:57.0) Gecko/20100101 Firefox/57.0';
axios.defaults.headers.common['Cookie'] = 'ckLang=CHS; ak_bmsc=65EC9C20CDB68BDBB54F41E0B7D53FF848F6D8B936280000B95B385A96A81E4C~plN/FdVSuRUHuv8kcu4o4kKQs0UQyDMgR4Le6VcKNJWRxXyoJprx2KANIBPisXeBQ5EaWBbnRqCyJJdUzmQaHSsF0nUHY0CcYsnXz7lioFffeJSg+it73Yw/rdiGzkDX9rcd7p1jJIePeTNFLcxQ5rNPJhiY9Yd2UYLXwtyVxBKgPXV6PCkmk03jbHdtlEPKWYd88kwm92Qq2H8Q/LUMP7l6dKQmlL/vdARkEqioHxzHk=; bm_sv=7F12FB1430638D82CD0DD162BA76F098~rEaU0khDioktS6+w1t0WdCAn3VShI+j9SXP2etKr3S2lFjeTp5f+F6NlajD4jKk11biBpV+OINouRRy5QIt8+2jVia8tXxvFwkYGSlZF4v2OqZZ7Zy06BLNzYcpVD+Atstpr2dYEkd0UirvasPZ4Mg==';
axios.defaults.headers.common['Host'] = 'www.jw.org';

const http = axios.create({});

export { http };
