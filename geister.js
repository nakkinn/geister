let board=new Array(6); //0:青　1:赤　2:黒　3:黒（青）　4:黒（赤）
for(let i=0;i<6;i++)    board[i]=new Array(6);
let enablesite=new Array(6);
for(let i=0;i<6;i++)    enablesite[i]=new Array(6);
let s,dx,dy,c,r,c1=c2=r1=r2=-1;
let start=true,ready1=ready2=false,counter=0,moti=[0,0,0,0];
let peer,room,pnum,turn=false;

function setup(){
    createCanvas(windowWidth,windowHeight);

    peer=new Peer({
        key: 'cf1155ef-ab9f-41a3-bd4a-b99c30cc0663',
        debug:1
    });

    peer.on('open',()=>{
        room=peer.joinRoom("geister",{
            mode:'sfu'
        });
        room.on('open',()=>{
            pnum=room.members.length+1;
        });
        room.on('peerJoin',peerId=>{
            console.log(peerId+"参加");
        });
        room.on('peerLeave',peerId=>{
            console.log(peerId+"退出");
        });
        room.on('data',message=>{
            console.log(message.data);
            receive(message.data);
        });
    });

    s=height*0.1;
    dx=dy=height*0.02;

    for(let i=1;i<5;i++)    for(let j=4;j<6;j++)    enablesite[i][j]=true;
}

function draw(){
    background(230);

    for(let i=0;i<6;i++)    for(let j=0;j<6;j++){
        stroke(0);
        fill(255);
        if((i==0||i==5)&&(j==0||j==5))  fill('#aaddff');
        if((i==c1&&j==r1)||(i==c2&&j==r2))  fill(190);
        rect(i*s+dx,j*s+dy,s,s);

        noStroke();
        if(board[i][j]==0)  fill('#0044ff');
        if(board[i][j]==1)  fill('#ff4444');
        if(board[i][j]>1)   fill(0);
        circle(i*s+dx+s*0.5,j*s+dy+s*0.5,s*0.8);
        if(board[i][j]>2){
            if(board[i][j]==3)  fill('#0044ff');
            else    fill('#ff4444');
            circle(i*s+dx+s*0.5,j*s+dy+s*0.5,s*0.4);
        }

        fill('#0044ff');
        for(let i=0;i<moti[0];i++)  circle(7*s+s*i*0.5,dy+s*0.5,s*0.4);
        for(let i=0;i<moti[2];i++)  circle(7*s+s*i*0.5,dy+s*5,s*0.4);
        fill('#ff4444');
        for(let i=0;i<moti[1];i++)  circle(7*s+s*i*0.5,dy+s*1,s*0.4);
        for(let i=0;i<moti[3];i++)  circle(7*s+s*i*0.5,dy+s*5.5,s*0.4);

        if(enablesite[i][j]==true){
            noFill();
            stroke('#ff7700');
            rect(i*s+dx+3,j*s+dy+3,s-6,s-6);
        }
    }
}

function mousePressed(){
    if(mouseButton==LEFT)   leftpress();
    if(mouseButton==RIGHT)  rightpress();
}

function leftpress(){
    let x=mouseX-dx;
    let y=mouseY-dy;
    let flag=false;

    if(x>=0&&x<s*6&&y>=0&&y<s*6){
        let c_=int(x/s),r_=int(y/s);

        if(start){
            if(enablesite[c_][r_]==true){
                enablesite[c_][r_]=false;
                board[c_][r_]=0;
                counter++;
            }
            if(counter==4){
                for(let i=1;i<5;i++)    for(let j=4;j<6;j++)    if(board[i][j]==undefined)  board[i][j]=1;
                room.send("ready");
                if(ready2){
                    start=false;
                    if(pnum==1) turn=true;
                }
                else{
                    ready1=true;
                }
                flag=true;
            }
        }else if(turn){
            if(board[c_][r_]<2){
                enable(c_,r_);
                c=c_,r=r_;
            }else if(enablesite[c_][r_]==true){
                board[c_][r_]=board[c][r];
                board[c][r]=undefined;
                room.send(c+','+r+','+c_+','+r_);
                c1=c_,r1=r_,c2=c,r2=r;
                flag=true;
                turn=false;
            }else{
                flag=true;
            }
        }
    }else if(!start)   flag=true;

    if(flag)    for(let i=0;i<6;i++)    for(let j=0;j<6;j++)    enablesite[i][j]=false;
}

function rightpress(){
    let x=mouseX-dx;
    let y=mouseY-dy;

    if(x>=0&&x<s*6&&y>=0&&y<s*6){
        let c_=int(x/s),r_=int(y/s);
        if(board[c_][r_]<2) room.send('f,'+c_+','+r_+','+board[c_][r_]);
    }
}

function keyPressed(){
    if(key=='r'){
        room.send("reset");
        reset();
    }
}

function enable(c_,r_){
    d=[[0,-1],[1,0],[0,1],[-1,0]];
    for(let i=0;i<6;i++)    for(let j=0;j<6;j++)    enablesite[i][j]=false;
    for(let i=0;i<4;i++){
        if(ins(c_+d[i][0],r_+d[i][1])){
            if(board[c_+d[i][0]][r_+d[i][1]]>1||board[c_+d[i][0]][r_+d[i][1]]==undefined)   
                enablesite[c_+d[i][0]][r_+d[i][1]]=true;
        }
    }
}

function ins(c_,r_){
    if(c_>=0&&c_<6&&r_>=0&&r_<6) return true;
    else    return false;
}

function receive(mes){
    if(mes=="reset"){
        reset();
    }else if(mes=="ready"){
        for(let i=1;i<5;i++)    for(let j=0;j<2;j++)    board[i][j]=2;
        if(ready1){
            start=false;
            if(pnum==1) turn=true;
        }else{
            ready2=true;
        }
    }else if(mes=="blue"){
        moti[2]++;
    }else if(mes=="red"){
        moti[3]++;
    }else{
        mes=mes.split(',');
        if(mes[0]=='f'){
            for(let i=1;i<4;i++)    mes[i]=int(mes[i]);
            mes[1]=5-mes[1];
            mes[2]=5-mes[2];
            board[mes[1]][mes[2]]=mes[3]+3;
        }else{
            for(let i=0;i<4;i++)    mes[i]=5-int(mes[i]);
            board[mes[0]][mes[1]]=undefined;
            if(board[mes[2]][mes[3]]<2){
                moti[board[mes[2]][mes[3]]]++;
                if(board[mes[2]][mes[3]]==0)    room.send("blue");
                else    room.send("red");
            }
            board[mes[2]][mes[3]]=2;
            c1=mes[0],r1=mes[1],c2=mes[2],r2=mes[3];
            turn=true;
        }
    }
}

function reset(){
    for(let i=0;i<6;i++)    for(let j=0;j<6;j++){
        board[i][j]=undefined;
        enablesite[i][j]=false;
    }
    for(let i=1;i<5;i++)    for(let j=4;j<6;j++)    enablesite[i][j]=true;
    for(let i=0;i<4;i++)    moti[i]=0;
    c1=c2=r1=r2=-1;
    if(pnum==1) pnum=2;
    else    pnum=1;
    counter=0;
    start=true;
    ready1=ready2=turn=false;
}