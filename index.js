#!/usr/bin/env node

require('dotenv/config');
const cron = require('node-cron');
const jenkinsapi = require('jenkins-api');
const fs = require('fs');
const path = require('path');
const conf = require('./conf.json');


function main() {
    //console.log(JSON.stringify(conf));
    console.log("***********************************");
    console.log(`I have ${conf.sources.length} sources dir`);
    console.log("***********************************");
    conf.sources.forEach(source => {
        //console.log(`Job: ${JSON.stringify(job)}`);
        console.log(`Source: ${source.sourcename} with ${source.rules.length} rules`);
        const runs = getAllRuns(source.src);
        source.rules.forEach(rule => {
            runs.forEach(run => {
                if (isRunCandidate(rule, source.src, run)) {
                    console.log(`---> Call jenkins in rule ${rule.name} for run: ${run}`);
                    const fullPath = path.join(source.src, run);
                    callJenkins(fullPath, rule.jenkinsjob);
                }
            });
        })

    })
    /*
    if (fs.existsSync("./teste")) {
        console.log("Sim teste");
    }
    */

}

function getAllRuns(src) {
    let runs = [];
    console.log(`Runs found in ${src}`);
    try {
        fs.readdirSync(src).forEach(file => {
            if (fs.lstatSync(path.resolve(src, file)).isDirectory()) {
                console.log(`\tRun... ${file}`);
                runs.push(file);
            }
        });
    } catch (ex) {
        const err = `Error to open dir ${src}`;
        throw err;
    }
    return runs;
}

function getAllValidRuns(src) {
    let runs = [];
    console.log(`********* ${src}`);
    fs.readdirSync(src).forEach(file => {
        if (fs.lstatSync(path.resolve(src, file)).isDirectory()) {
            if (isRunCandidate(rule, file))
                runs.push(file);
        }
    });
    return runs;
}


//TODO: colocar toda a validação aqui, incluindo a questão de olhar os arquivos que devem existir (exemplo copyCompleted)
/*
function isRunCandidate(rule) {
    if (rule.fileSkip) {
        return fs.existsSync(rule.fileSkip);
    }
    return false;
}
*/

function isRunCandidate(rule, source, run) {
    //console.log(`running isRunCandidate fileskip: ${rule.fileSkip}  src: ${source} run: ${run}`);
    let isRunCandidate = true;
    if (rule.fileSkip) {
        const fullPath = path.join(source, run, rule.fileSkip);
        //console.log(`....yes ${fullPath}`);
        let fileSkipExist = fs.existsSync(fullPath);
        if (fileSkipExist) {
            isRunCandidate = false;
        } else {
            rule.files.forEach(file => {
                //console.log(`Olhando o arquivo ${file.filename} existe`);
                if (!fs.existsSync(path.join(source, run, file.filename))) {
                    isRunCandidate = false;
                    return false;
                }

                if (file.fileContent) {
                    const fileContent = fileread(path.join(source, run, file.filename));
                    //console.log(`xxxx Comparando... \n--\n${fileContent}\n--\nem busca de ${file.fileContent}`);
                    if (!fileContent.includes(file.fileContent)) {
                        isRunCandidate = false;
                        return false;
                    }

                    /*
                    fs.readFile(path.join(source, run, file.filename), function (err, data) {
                        if (err) throw err;
                        if (data.includes(file.fileContent)) {
                            console.log(`opa ----> ${data}`);
                        }else{
                            return false;
                        }
                    });
                    */
                }

            });
            //console.log(`oooooooooooooooooooooooooooo ${fullPath}`);
            return isRunCandidate;
        }

    }
    return false;
}



function callJenkins(run, jenkinsJob) {

    console.log(`Call Jenkins to run ${run} on queue ${jenkinsJob}`);
    console.log(`Process env URL-> ${process.env.JENKINS_URL} TOKEN->${process.env.JENKINS_TOKEN}`);

    var jenkins = jenkinsapi.init(process.env.JENKINS_URL);

    jenkins.build('wgs_pipeline_work2', {token: process.env.JENKINS_TOKEN, }, function(err, data) {
        if (err){ return console.log(err); }
        console.log(data)
      });


/*
//ESTE É O OK
    var jenkins = jenkinsapi.init(URL_PASS);

    jenkins.build('wgs_pipeline_work2', {token: 'bclconvertertoken2', }, function(err, data) {
        if (err){ return console.log(err); }
        console.log(data)
      });
*/


    /*
    jenkins.build_with_params('wgs_pipeline_work2', { run: 'OlhaOTeste' }, function (err, data) {
        if (err) { return console.log(`Ops: Error \n ${err}`); }
        console.log(`It's ok ${data}`);
    });
    */




    /*
    var jenkins = jenkinsapi.init('http://marcelo:11c764e338e0a006d415dadb1b8cd34ece@localhost:8080');

    jenkins.build_with_params('tst3', { run: 'OlhaOTeste' }, function (err, data) {
        if (err) { return console.log(`Ops: Error \n ${err}`); }
        console.log(`It's ok ${data}`);
    });
    */
}

//    var jenkins = jenkinsapi.init('http://user:hash@localhost:8080');
//
//    jenkins.build('tst1', function(err, data) {
//        if (err){ return console.log(`Ops: Error \n ${err}`); }
//        console.log(`It's ok ${data}`);
//      });
//
//curl -X POST http://localhost:8080/job/tst1/build --user user:hash;


function runAsDaemon() {
    console.log(`Running at ${conf.cron}`)
    let task = cron.schedule(conf.cron, () => {
        console.log('stoped task');
        main();
    }, {
        scheduled: false
    });

    task.start();
}

function fileread(filename) {
    var contents = fs.readFileSync(filename);
    return contents.toString();
}



main();
//runAsDaemon();
