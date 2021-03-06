global.electron=require("electron");
global.mainapp=electron.remote.app;
global.appwindow=electron;
global.isdev=window.location.href.split("/").reverse()[1]=="app";
global.electron=true;

require("app-module-path").addPath(require("path").join(__dirname,"..",".."));
require("core/tools");

global.isofile="";
if (isdev) {
  require("core/isdev");
}

try {
  global.isvm=iISVM();
  global.needsroot=false;
} catch(e) {
  global.isvm=false;
  console.error("%cRUN AS ROOT!","color:red; font-size:30px;");
  module.exports={};
  global.needsroot=true;
  swal({
      title:"Requires Admin Permissions to run",
      text:"Run this application again as root",
      showConfirmButton: false,
      type:"error"
    });
  setTimeout(mainapp.quit,5000);
  return module;
}

global.install=false;

if (isos) {
  if (kernelcmd.osloaderinstall) {
    install=true;
  } else if (kernelcmd.osloadersettings) {
    try {
      global.devuuid=kernelcmd.osloaderuuid;
      global.device=require("fs").realpathSync("/dev/disk/by-uuid/"+devuuid);
      fs.lstatSync(device);
      global.targetdevice=device;
      global.maintarget=device.substr(0,device.length-1);
      fs.lstatSync(maintarget);
      global.install=false;
    } catch(e) {
      global.targetdevice="";
      global.device="";
      global.maintarget="";
      global.install=true;
    }
  } else {
    swal("WRONG KERNEL PARAMETERS!","","error");
  }
} else {
  install=true;
  if (isdev) {
    try {
      fs.lstatSync(process.env.targetdevice);
      global.targetdevice=process.env.targetdevice;
      global.device=process.env.targetdevice;
      global.maintarget=device.substr(0,device.length-1);
      fs.lstatSync(maintarget);
      global.install=false;
    } catch(e) {
      global.targetdevice="";
      global.device="";
      global.maintarget="";
      global.install=true;
    }
  }
}

global.install=install;
global.active=!install;

console.warn("%cWARNING!%cAny code you paste here has access to your data and network!","color:orange; font-size:25px;","color:red; font-size:15px;");

var ee=require("events").EventEmitter;
var events=new ee();
var safeClose=false;

window.rReload=false;
app.isDev=isdev;

if (isos) {
  //global.imagedir="/lib/live/mount/rootfs/filesystem.squashfs";
  global.imagedir="";
  global.imagepath="/lib/live/mount/medium/filesystem.squashfs"
  global.mountdir="/usb"
} else {
  global.imagedir="/tmp/os-loader.image"
  global.imagepath=global.imagedir+".live/live/filesystem.squashfs"
  global.mountdir=global.imagedir+"/usb";
}

function scriptout() {
  var e=new ee();
  const self=this;
  this.lines=[];
  global.cEV=e;
  e.on("line",function(l) {
    if (isdev) console.log("%c"+l.l,"color:"+((l.c=="white")?"black":l.c));
    if (l.l.startsWith("+ ")||l.l.startsWith("++ ")) return; //do not spam the stack traces
    self.lines=self.lines.concat([l]).slice(-25);
    app.scriptlines=self.lines;
  });
  e.on("print",function(l,c) {
    app.scriptlines=self.lines.concat([{l:l,c:c}]);
  });
  e.on("progress",function(p) {
    app.scriptprogress=p;
  });
  e.on("state",function(s) {
    app.scriptstate=s;
  });
  e.emit("line",{c:"white",l:"> OS Loader"});
  this.clear=function() {
    self.lines=[];
    app.scriptlines=[];
  }
}

function asyncOk() {
  app.hideMenu=false;
  page.redirect(app.baseUrl);
  app.asyncReady=true;
  if (!install) require("core/mainapp");
}

app.asyncReady=false;
app.hideMenu=true;
function async() {
  if (isdev) events.emit("updateFound");
  if (active) {
    udev.getInfo(device.replace("/dev","/sys/class/block"),function(e,d) {
      if (e) return swal(e.toString(),e.toString(),"error");
        script("mount",[device,d.ID_FS_TYPE],function(e) {
          if (e) return swal(e.toString(),e.toString(),"error");
          config.init();
          asyncOk();
        });
    });
  } else {
    asyncOk();
  }
}
setTimeout(async,5);

function actions() {
  function tutorial() {
    $(".tutorial").fadeOut("fast");
  }
  this.tutorial=tutorial;
}
function doExit(isConfirm) {
  function finalShutdown() {
    swal({
      title:"Shutdown...",
      text:isos?"Rebooting into BootLoader...":"Closing the App...",
      showConfirmButton: false
    });
    app.$.mainContent.hidden=true;
    safeClose=true;
    if (isos) {
      spawn("reboot",["-f"]);
    } else {
      setTimeout(mainapp.quit,10);
    }
  }
  function execShutdown() {
    script("shutdown",[],"Shutdown the App",function(e) {
      if (e) {
        swal({
          title:"Shutdown Failed!",
          text:e.toString(),
          showCancelButton: true,
          confirmButtonText:"Force Shutdown!",
          cancelButtonText:"Try again...",
          closeOnConfirm:false,
          closeOnCancel:false,
          confirmButtonColor: "#DD6B55"
        },function(force) {
          if (force) {
            finalShutdown();
          } else {
            execShutdown();
          }
        });
      } else {
        finalShutdown();
      }
    });
  }
  if (isConfirm) {
    global.cEV.on("state",function(s) {
      swal({
        title:"Shutdown...",
        text:s+"...",
        showConfirmButton: false
      });
    });
    execShutdown();
  }
}
function askExit() {
  swal({
    title: "Are you sure?",
    text: isos?"This will reboot into the BootLoader!":"This will close the app!",
    showCancelButton: true,
    confirmButtonColor: "#DD6B55",
    confirmButtonText: "Yes",
    cancelButtonText: "No",
    closeOnConfirm: false
  },
    doExit);
}
window.onbeforeunload = (e) => {
  if (!window.rReload) if (!safeClose) { e.returnValue = false;return isos?askExit():doExit(true);}
};
module.exports={ee:ee,config,scriptout:new scriptout(),install:install,active:active,events:events,osmode:isos,isos:isos,askExit:askExit,action:new actions(),mainapp:mainapp};
