import socket
import json
from flask import Flask, render_template , redirect , url_for , request
app = Flask(__name__)


HOST = "127.0.0.1"
PORT = 9999

w = 600
h = 600
game_data = {}
def reset():
    global game_data

    game_data = {
        "p1" : {
            "x" : 10,
            "y" : (h - 100) / 2,
            "px" : 10,
            "py" : (h - 100) / 2,
            "w" : 10,
            "h" : 100,
            "vely" : 5,
        },
        "p2" : {
            "x"  :w - 20,
            "y" : (h - 100) / 2,
            "px" : 10,
            "py" : (h - 100) / 2,
            "w" : 10, 
            "h": 100,
            "vely" : 5,
        },
        "ball" : {
            "x" : (w - 10) / 2,
            "y" : (h - 10) / 2,
            "w" : 10,
            "h" : 10,
            "vel" : {
                "x" :1,# Math.floor(Math.random() * 10) + 1 ,
                "y" :0,# Math.floor(Math.random() * 10) + 1 ,
            }
        }    

    }

reset()

@app.route("/")
def index():
    return render_template("server_managment.html")

@app.route("/game")
def game():
    player_id = request.args["player_id"]
    print(f"plyer id : {player_id}")
    return render_template("game.html")    

@app.route("/1")
def clicked():
    print("python bg")
    return ""

@app.route("/host_server")
def host():
    print("host_server")
    with socket.socket(socket.AF_INET,socket.SOCK_STREAM) as s:
        s.bind((HOST,PORT))
        s.listen()
        conn , addr = s.accept()
        with conn:
            print(f"connected to {conn} {addr}")
            while True:
                data = conn.recv(1024)
                if not data: 
                    print("    no data")
                    break
                print(f"    data: {data.decode()}")
    print("         redirct!!!")
    return redirect(url_for("game",player_id="1"))



@app.route("/connect_to_server")
def connect_to_server():
    print("connect_to_server")
    with socket.socket(socket.AF_INET,socket.SOCK_STREAM) as s:
        s.connect((HOST,PORT))
        s.sendall(b"hi i like ur mama")

    return redirect(url_for("game",player_id="2"))

@app.route("/data",methods=["POST","GET"])
def data():

    g_state_data = request.json
    
    print('                                  -> ',game_data,g_state_data )

    if g_state_data["have_to_reset"]:
        reset()


    if "p" in g_state_data:
        game_data[f"p{g_state_data['player_id']}"] = g_state_data["p"]

    if "ball" in g_state_data:
        game_data["ball"] = g_state_data["ball"]
        print(f"BALL: {g_state_data['ball']}")
    
    game_data["ball"]["x"] += game_data["ball"]["vel"]["x"]
    game_data["ball"]["y"] += game_data["ball"]["vel"]["y"]

    return json.dumps(game_data)


if __name__ == "__main__":
    app.run(debug=True)

