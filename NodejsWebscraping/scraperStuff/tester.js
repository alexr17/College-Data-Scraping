var xArr = [1,3,6,8,5,4,7,4,7,4,7,9,3,6]
var yArr = [1,2,3,4,5,6,7,8,9,2,4,6,3,4]
var lett = ['a','b','c','d','e','f','g','h','i']
var coeffTable = []
var sysEq = []

//we have to get a bunch of equations and then solve those equations for the coefficients

/*
ds/da: a*sumSquare(xArr, polyOrder*2) + b*sumSquare(xArr, polyOrder*2-1) + ... + (polyOrder+1)*sumSquare(xArr, polyOrder/2)
ds/db: a*sumSquare(xArr, polyOrder*2-1) + b*sumSquare(xArr, polyOrder*2-2) + ... + (polyOrder+1)*sumSquare(xArr, polyOrder/2-1)
... ....
ds/dn: a*sumSquare(xArr, polyOrder) + b*sumSquare(xArr, polyOrder-1) + ... + n*sumSquare(xArr, 0)
*/

//432,321,210
//6543,5432,4321,3210
//87654,76543,65432,54321,43210
//1098765,987654,876543,765432,654321,543210

//until we make this user robust
var polyOrder = 3;

//each value in the array should be the values A, B, C, etc. in ds/da if ds/da = Aa + Bb + Cc ...
var coeffArr = []


//console.log(sumSquare(xArr, 0))
populateCoeff(printCoeff)

console.log(sysEq)

var equation = replaceEq(0)
equation = simplifyEq(equation, 0)

console.log(equation)

function sumSquare(arr1,arr2,power1,power2) {
  var sum = 0;
  for (var ii = 0; ii < arr1.length; ii++) {
    sum += Math.pow(arr1[ii],power1) * Math.pow(arr2[ii],power2);
    //console.log(Math.pow(arr[ii], power))
  }
  return sum;
}

function populateCoeff(_callback) {
  //populate the coefficient array
  for (var ii = polyOrder*2; ii >= 0; ii--) {
    coeffArr.push(sumSquare(xArr,new Array(xArr.length+1).join('0').split('').map(parseFloat),ii,0))
  }
  _callback();
}

function printCoeff() {
  //console.log(coeffArr);
  //now we need to store the data
  var total = 0
  for (var ii = 0; ii < polyOrder + 1; ii++) {
    var line = 'ds/d' + lett[ii] + ': ' + lett[ii] + ' = ';
    
    coeffTable.push([]);
    total = sumSquare(xArr,yArr,polyOrder-ii,1)
    
    line += '( ' + total
    for (var jj = 0; jj < polyOrder + 1; jj++) {
      if (jj!=ii) {
        line += ' - ' + lett[jj] + ' * ' + coeffArr[ii + jj]
      }
      coeffTable[ii][jj] = coeffArr[ii+jj]
    }
    line += ' ) / ' + coeffArr[ii + ii]

    sysEq.push(line.replace(/(ds\/d[a-i]: [a-i] = )/g, ''))
    console.log(line) 
  }
}

function replaceEq(val) {
  var equation = '';
  equation = sysEq[val]
  equation = equation.split(lett[polyOrder]).join(sysEq[polyOrder])
  return equation
}


function simplifyEq(eq, letter) {
  //eq = eq.split(' ')
  var simpArr = eq.match(/(\d+ \* \d+)/g)
  var newArr = []
  for (var ii = 0; ii < simpArr.length; ii++) {
    newArr[ii] = eval(simpArr[ii])
    eq = eq.replace(simpArr[ii], newArr[ii])
  }
  return eq
}
