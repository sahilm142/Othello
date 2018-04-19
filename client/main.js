var p1display = $('#p1disp');
var p2display = $('#p2disp'); 
var white = 2;
var black = 2;

var mat = new Array(8);
for(var i=0;i<8;i++){
  mat[i] = new Array(8);
}

var socket = io();
var games;
var token;
var id;

function newGame(){
  var token = $('#token').val();
  socket.emit('newGame',{token:token});
}

socket.on('tokenExists',function(data){
  $('#token').val("");
  alert('Token Id already taken');
});

socket.on('gameCreated',function(data){
  token=data.token;
  $('#join').addClass('hide');
  $('#boxshow').removeClass('hide');  
  $('#board').removeClass('hide');
  id=1;
});

function joinGame(){
  var tokenId=$('#token').val();
  socket.emit('joinGame',{token:tokenId});
}
socket.on('joined',function(data){
  console.log("Player 2 joins");
});
socket.on('invalidToken',function(){
  $('#token').value="";
  alert('Invalid Token Id');
});

socket.on('fullGame',function(){
  $('#token').val("");
  alert('Create new Game');
});

socket.on('gameJoined',function(data){
  token = data.token;
  var opponent=data.opponent;
  $('#join').addClass('hide');
  $('#boxshow').removeClass('hide');
  $('#board').removeClass('hide');
  id=-1;
  //$('#p2').html(opponent);
  //$('#p1').html('Black');
});

// for creating 8X8 board
var space = 1;
for (var r=0; r<8; r++) {
  var col = "";
  for (var c=0; c<8; c++) {
    col += "<td data-pos='"+space+"'></td>";
    space++;
    mat[r][c]=0;
  }
  $("#board").append("<tr>"+col+"</tr>");
  $('#board').css('background-color','green');
  $(document).ready(function(){
    $('#board tr:nth-child(4) td:nth-child(4)').css('background-color','black');
    $('#board tr:nth-child(5) td:nth-child(5)').css('background-color','black');
    $('#board tr:nth-child(4) td:nth-child(5)').css('background-color','white');
    $('#board tr:nth-child(5) td:nth-child(4)').css('background-color','white');           
  });

}
/**
 * 1-black
 * -1-white
 * 0-none
 */

mat[3][3] = 1;
mat[3][4] = -1;
mat[4][3] = -1;
mat[4][4] = 1;

var turn = 1;

socket.on('keyPressed',function(data){
  var i=data.i;
  var j=data.j;
 // alert(i+" "+j);
  if(mat[i][j]!=0)return;
  var c=0;
  for(var ix=-1;ix<=1;ix++){
      for(var jx=-1;jx<=1;jx++){
          if(ix==0&&jx==0)continue;
          if(check(i+ix,j+jx,ix,jx))c=c+1;
      }
  }
  if(c>0){
      changeColor(i,j,turn);
      turn=-turn;
  }
});
$('#board tr td').on('click', function(){
    var col = $(this).parent().children().index($(this));
    var row = $(this).parent().parent().children().index($(this).parent());
   // alert(row+" "+col);
    if(mat[col][row]!=0) return; 
    if(id==turn)
    socket.emit('keyPressed',{id:id,i:col,j:row});
    else
    alert('not your turn');   
    // console.log(row+" "+col+" "+mat[row][col]);
    //$(this).css('background-color','#ff0000');
});

function check(i,j,ix,jx){
  var c=0,i0=i,j0=j,x=0;
  while(true){
    if(i>7||i<0||j>7||j<0)break;
    if(mat[i][j]==0)
    break;
    else
    if(mat[i][j]==turn){
        x=1;
        break;
    }
    else{
        c++;
        i=i+ix;
        j=j+jx;
    }
  }
  if(x==0||c==0)return false;
  i=i0;
  j=j0;
  while(true){
      if(i>8||i<1||j>8||j<1)break;
      if(mat[i][j]==turn){
          break;
      }
      else{
          changeColor(i,j,turn);
          i=i+ix;
          j=j+jx;
      }
  }
  return true;
}

function changeColor(i,j,turn){
  if(mat[i][j] == 0){
      if(turn == 1)
      white++;
      else
      black++;
  }
  else if(mat[i][j]==1 && turn==-1){
      white--;
      black++;
  }
  else if(mat[i][j] == -1 && turn == 1){
      white++;
      black--;
  }
  mat[i][j] = turn;
  var y = j+1;
  var x = i+1;
  //white
  if(turn==1){
      $('document').ready(function(){
        $('#board tr:nth-child('+y+') td:nth-child('+x+')').css('background-color','#000000');
      });
  }
  //black
  else{
    $('document').ready(function(){
      $('#board tr:nth-child('+y+') td:nth-child('+x+')').css('background-color','#ffffff');
    });
  }
  p1display.html(white);
  p2display.html(black);
}


$('#reset').on('click', function(){
  white = 2;
  black = 2;
  p1display.html(white);
  p2display.html(black);
  location.reload();
});


//Result
$('#end').on('click',function(){
  var result = "Result: ";
  if(white>black)
    result+="p1 won";
    else if(white<black)
    result+="p2 won";
    else
    result+="tie";
    alert(result);
    location.reload();
});

