import math
import random
HOST = "127.0.0.1"
PORT = 9999

w = 600
h = 400
game_data = {}

pong_w = 0.02 
ball_w = 0.025
ball_h = 0.025


def reset():
    global game_data

    game_data = {
        "p1" : {
            "y" : (1 - 0.2) / 2,
            "x" : (1 - pong_w * 2),
            "py" : (h - 100) / 2,
            "w" : pong_w, 
            "h": 0.2,
            "vely" : 5,
        },
        "p2" : {
            "y" : (1 - 0.2) / 2,
            "x" : pong_w,
            "py" : (h - 100) / 2,
            "w" : pong_w, 
            "h": 0.2,
            "vely" : 5,
        },
        "ball" : {
            "x" : 0.5,
            "y" : 0.5,
            "w" : ball_w,
            "h" :ball_w,
            "vel" : {
                "x" :random.randint(-5,5),
                "y" :random.randint(-2,2), 

            }
        },
        "board_w" : pong_w,
    }

    mag = math.sqrt(game_data["ball"]["vel"]["x"]**2 + game_data["ball"]["vel"]["y"]**2)
    game_data["ball"]["vel"]["x"] /= mag * 100
    game_data["ball"]["vel"]["y"] /= mag * 100

    
def AABB(a,b):
    return a["x"] + a["w"] > b["x"] and a["y"] + a["h"] > b["y"] and b["x"] + b["w"] > a["x"] and b["y"] + b["h"] > a["y"] 
def update(client_data):
    global game_data
    if client_data["have_to_reset"]:
        reset()
        return


    player_id = int(client_data['player_id'])
    if "p" in client_data:
        game_data[f"p{player_id}"] = client_data["p"]
        game_data[f"p{player_id}"]["y"] /= client_data["h"]
        game_data[f"p{player_id}"]["h"] /= client_data["h"]
        
        game_data[f"p{player_id}"]["w"] /= client_data["w"]

    if player_id == 1:

        if "ball" in client_data:
            game_data["ball"] = client_data["ball"]

            game_data["ball"]["y"] /= client_data["h"]
            game_data["ball"]["h"] /= client_data["h"]
            game_data["ball"]["vel"]["y"] /= client_data["h"]
            game_data["ball"]["x"] /= client_data["w"]
            game_data["ball"]["w"] /= client_data["w"]
            game_data["ball"]["vel"]["x"] /= client_data["w"]


        if AABB(game_data["p1"],game_data["ball"]) or AABB(game_data["p2"],game_data["ball"]):
            game_data["ball"]["vel"]["x"] = -game_data["ball"]["vel"]["x"]
    
        game_data["ball"]["x"] += game_data["ball"]["vel"]["x"]
        game_data["ball"]["y"] += game_data["ball"]["vel"]["y"]