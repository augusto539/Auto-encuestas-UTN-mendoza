// REQUIRES
const axios = require('axios');
const cheerio = require('cheerio');
// VARIABLES
// get_info
let class_code = '';
let materia = '';
let info_alumno = {ano: '', especialidad: '', plan:''};
// encuesta
let calification = '-1';
let span = '';
let posision_1 = '';
let posision_2 = '';
let initials = '';
let student_part = new Object();       // student part of the survey
let prof_res = new Object();    // multiple choise part of the professor part of the survey
let prof_res_text = new Object();   // text part of the professor part of the survey
let prof_text = '★';       // the text that is going to be send in the survey
let info_encuesta = {legajo: '',ano: '',especialidad: '',materia: '',plan: '',comisionalumno: '',prof1: '',prof3: '',prof4: '',prof5: '',prof6: '',check: '',grabadatos: '',button2: ''};
let dic_post = {};
let string_post = '';

// function to replace characters
String.prototype.replaceAt = function(index, replacement) {return this.substr(0, index) + replacement + this.substr(index + replacement.length);};

// get a list of topics that have surveys to complete and the info of the student
async function get_info(url){
    let materias = [];
    const response = await axios({  // make a get request to the "Por favor Conteste las Siguientes Encuestas Docentes" page
      method: 'GET',
      url: url,
      responseType: 'arraybuffer',
      responseEncoding: 'binary' // this encode the response in binary, this is to have all the characters right
    });
    let data = response.data.toString('binary'); // convert the binary into a string
    const $ = cheerio.load(data); // load the response (in string form) in cherio
    if ($("span[class='title']").text().includes('Problemas')) { //  if the loaded page have the "Problemas" string in the title, it means that the legajo inputed don't exist                                
      return {error: `Numero de legajo invalido`}; // return a error with a text saying that the legajo is invalid
    } else {
      if ($('a').length < 1) {  // if the number of anchor tags is less than one it means that all the surveys are already completed
        return {error: `No quedan encuestas por responder`}; // return a error with a text saying that all surveys are already completed
      } else {
        $('a').each((parentIdx,parentElm) =>{    // this iterates in all the anchor tags   
          class_code = $(parentElm).attr('onclick');  // gets what is in the "onclick" attribute, that have this form: document.forms['a107271295'].submit()
          class_code = class_code.slice(17, 20);    // gets the values between the 17 and 20 plase
          materia = $(parentElm).text();    // gets the text of the 'a' tag 
          materias.push({code:class_code, text:materia}); // push the an object with the class code and the name of the class
        });
        // save the student info in an object
        info_alumno = {ano: $("input[name='ano']").attr('value'),especialidad: $("input[name='especialidad']").attr('value'),plan: $("input[name='plan']").attr('value')};  
        return {materias:materias, info:info_alumno}; // return an object with the classes list and the info object
      }; 
    };
};

// make a post request to the "Por favor Conteste las Siguientes Encuestas Docentes", then make a post to the surveys to complete them
async function encuesta(url,data,req){
    let siglas = [];
    for (let i = 0; i < (Object.keys(req.body).length - 1); i++) { // loop in all the surveys to complete
      let params = `legajo=${req.params.legajo}&ano=${data.ano}&especialidad=${data.especialidad}&materia=${req.body[i]}&plan=${data.plan}`; // set the params of the post to the "Por favor Conteste las Siguientes Encuestas Docentes" page
      // change the string valuo of the option input to a numeric one
      if (req.body['option'] == 'ns') {
        calification = '-1';
      };
      if ((req.body['option']) == 'siempre'){
        calification = '4';
      };
      if ((req.body['option']) == 'insuficiente'){
        calification = '0';
      };
      const response_encoded = await axios({  // send a post request to the"Por favor Conteste las Siguientes Encuestas Docentes" page
        url: url,
        method: 'POST',
        data: params,
        responseType: 'arraybuffer',
        responseEncoding: 'binary'
      });
      let response_decoded = response_encoded.data.toString('binary');  // decode the response
      const $ = cheerio.load(response_decoded); // load the response in cherio
      $('table').find("span[class='Estilo20']").each((parentIdx,parentElm) =>{  // serch for the span with class 'Estilo 20' in the table tags
        span = $(parentElm).html();  // get the text of the span
        // serch for a '(' in the span and take the value between them
        if (span.includes('(')) {
          posision_1 = span.indexOf("(");  // take the index of the first '('
          posision_2 = span.indexOf(")");   // take the index of the first ')'
          initials = span.slice((posision_1 + 1), posision_2); // take the value between the braquets
          initials = initials.toLocaleLowerCase();   // pasrses the value to lowercase
          siglas.push(initials); // saves in the siglas array
        };
      });
      // set the student_part var with the values of the calification var
      for (let i = 1; i < 8; i++) {
        student_part['p'+i] = calification;
      };
      // this foreach if for complete the multiple choise part of the professor part of the survey
      siglas.forEach(element => {
        for (let i = 1; i < 20; i++) {
          if (element.charAt(0) == 'j') {
            if (i == 5 || i == 9 || i == 10 || i == 19){    // some professors  don't hava all the camps of the survey, this skip this special cases
              continue
            }
            prof_res[element+i] = calification;
          } else if (element.charAt(0) == 'a') {
            if (i == 5 || i == 9 || i == 10 || i == 16 || i == 19){ // some professors  don't hava all the camps of the survey, this skip this special cases
              continue
            }
            prof_res[element+i] = calification;
          } else {
            prof_res[element+i] = calification;
          }
        }
      });
      // this foreach if for complete the text part of the professor part of the survey
      /*
      siglas.forEach(element => {
        for (let i = 8; i < 11; i++) {
          prof_res_text[element+'_'+i] = prof_text;
        }
      });
      */
      // get values form the survey and saves in the info encuesta variable, this values are important to do the las post
      info_encuesta = {
        legajo: $("input[name='legajo']").attr('value'),
        ano: $("input[name='ano']").attr('value'),
        especialidad: $("input[name='especialidad']").attr('value'),
        materia: $("input[name='materia']").attr('value'),
        plan: $("input[name='plan']").attr('value'),
        comisionalumno: $("input[name='comisionalumno']").attr('value'),
        prof1: $("input[name='prof1']").attr('value'),
        prof3: $("input[name='prof3']").attr('value'),
        prof4: $("input[name='prof4']").attr('value'),
        prof5: $("input[name='prof5']").attr('value'),
        prof6: $("input[name='prof6']").attr('value'),
        check: $("input[name='check']").attr('value'),
        grabadatos: $("input[name='grabadatos']").attr('value'),
        button2: $("input[name='button2']").attr('value')
      };
      //dic_post = {...student_part, ...prof_res, ...prof_res_text, ...info_encuesta }; // combine all the objects with info to form the post object
      dic_post = {...student_part, ...prof_res, ...info_encuesta }; // combine all the objects with info to form the post object
      // transform the dic_post object into a string
      for (const key of Object.keys(dic_post)) {
        string_post = string_post + key + "=" + dic_post[key] + '&';
      };
      string_post = string_post.replaceAt((string_post.length - 1), " ");   // eliminate the last "&" from the string    
      // send a post request to the survey page 
      axios({
        url: url,
        method: 'POST',
        data: string_post,
      });
    };
};

module.exports.get_info = get_info;
module.exports.encuesta = encuesta;