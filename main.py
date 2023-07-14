import socket
import json
from flask import Flask, render_template , redirect , url_for , request
import game_server
app = Flask(__name__)





@app.route("/")
def index():
    game_server.reset()
    return render_template("server_managment.html")

@app.route("/game")
def game():
    game_server.layer_id = request.args["player_id"]
    return render_template("game.html")    

@app.route("/host_server")
def host():
    with socket.socket(socket.AF_INET,socket.SOCK_STREAM) as s:
        s.bind((game_server.HOST,game_server.PORT))
        s.listen()
        conn , addr = s.accept()

    return redirect(url_for("game",player_id="1"))

@app.route("/connect_to_server")
def connect_to_server():
    with socket.socket(socket.AF_INET,socket.SOCK_STREAM) as s:
        s.connect((game_server.HOST,game_server.PORT))

    return redirect(url_for("game",player_id="2"))

@app.route("/data",methods=["POST","GET"])
def data():
    client_data = request.json
    game_server.update(client_data)
    return json.dumps(game_server.game_data)

if __name__ == "__main__":
    app.run(debug=True)

