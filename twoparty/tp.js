SECURITY_PARAMETER = 256;

var nacl = nacl_factory.instantiate();

function SecretRepresentation() {
    this["0"] = nacl.random_bytes(SECURITY_PARAMETER/8);
    this["1"] = nacl.random_bytes(SECURITY_PARAMETER/8);
    this["h0"] = nacl.to_hex(nacl.crypto_hash_sha256(nacl.to_hex(this["0"])));
    this["h1"] = nacl.to_hex(nacl.crypto_hash_sha256(nacl.to_hex(this["1"])));
}

function xor3(a, b, c) {
    output = []
    for (var i = 0; i < a.length; i++) {
        output.push(a[i] ^ b[i] ^ c[i]);
    }
    return output
}

function And() {
    //Represents a single And gate, returning the truth table in a random order.
    //We hold onto the representations of 0 and 1 for each wire, so it's ok to
    //always return the truth table shuffled.
    //
    //We will set the convention that Alice (us) puts our input on i_0 and Bob
    //on i_1.
    this.i = { "i0": new SecretRepresentation(),
               "i1": new SecretRepresentation() }
    this.o = { "o0": new SecretRepresentation() }
    this.gen_truth_table = function () {
        var outputarray = [
            xor3(this.i["i0"][0], this.i["i1"][0], this.o["o0"][0]),
            xor3(this.i["i0"][0], this.i["i1"][1], this.o["o0"][0]),
            xor3(this.i["i0"][1], this.i["i1"][0], this.o["o0"][0]),
            xor3(this.i["i0"][1], this.i["i1"][1], this.o["o0"][1]),
        ];
        outputarray = shuffle(outputarray)
        return outputarray
    };
    this.gen_hex_truth_table = function() {
        var tt = this.gen_truth_table();
        var tth = []
        for (var i = 0; i < tt.length; i++) {
            tth.push(nacl.to_hex(tt[i]));
        }
        return tth;
    };
    this.truth_table = this.gen_truth_table();
    this.hex_truth_table = this.gen_hex_truth_table();
}

function oblivious_transfer_to_bob() {
    //Bob gets to pick a representation of 0 or 1, depending on whether or not he's DTF.
    //TODO: Implement this function
    return 0;
}

//https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array-in-javascript
//TODO: Make this cryptographically secure
function shuffle(o){
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}

function evaluate_reply(reply_hashes, and_gate) {
    //We get a reply from Bob in the form of a sha256 hash for each row
    //in the truth table. Only one of these will correspond to a valid
    //one or zero, and we need to figure out which one.

    //Right now this comparison is hardcoded for gates with only one output
    var h0 = and_gate.o["o0"]["h0"]
    var h1 = and_gate.o["o0"]["h1"]
    console.log(h1);
    for (var i = 0; i < reply_hashes.length; i++) {
        if (reply_hashes[i] == h0) {
            return 0;
        } else if (reply_hashes[i] == h1) {
            return 1;
        }
    }
    console.log("Bob didn't send back a valid output value!");
}

function receive_alice_data(data) {
    //Here Bob receives a data structure from Alice containing
    //the masked truth table and Alice's bit selection representation
    truth_table = data["truth_table"];
    alice_selection = data["alice_selection"]
}

function get_choice_from_user() {
    return document.getElementById("dtf").checked ? 1 : 0;
}

function send_to_bob(data) {
    console.log(data);
}

///////////
// ALICE //
///////////

function alice() {
    var and_gate = new And();
    var encoded_choice = nacl.to_hex(and_gate.i["i0"][get_choice_from_user()]);
    var encoded_truth_table = and_gate.hex_truth_table;
    send_to_bob(JSON.stringify({
        "encoded_choice": encoded_choice,
        "encoded_truth_table": encoded_truth_table
    }));
}

///////////
//  BOB  //
///////////

function bob() {
}
