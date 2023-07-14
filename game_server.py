HOST = "127.0.0.1"
PORT = 9999

w = 600
h = 400
game_data = {}



def reset():
    global game_data

    game_data = {
        "p1" : {
            "y" : (h - 100) / 2,
            "x" : 10,
            "py" : (h - 100) / 2,
            "w" : 10,
            "h" : 100,
            "vely" : 5,
        },
        "p2" : {
            "y" : (h - 100) / 2,
            "x" : (w - 20),
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
                "x" :-1,# Math.floor(Math.random() * 10) + 1 ,
                "y" :0,# Math.floor(Math.random() * 10) + 1 ,
            }
        }    

    }

def AABB(a,b):
    return a["x"] + a["w"] > b["x"] and a["y"] + a["h"] > b["y"] and b["x"] + b["w"] > a["x"] and b["y"] + b["h"] > a["y"] 

def update(client_data):
    global game_data
    if client_data["have_to_reset"]:
        reset()
        return


    if "p" in client_data:
        player_id = int(client_data['player_id'])
        if player_id == 1:
            game_data["p1"] = client_data["p"]
        else:
            game_data["p2"] = client_data["p"]
    if "ball" in client_data:
        game_data["ball"] = client_data["ball"]

    if AABB(game_data["p1"],game_data["ball"]) or AABB(game_data["p2"],game_data["ball"]):
        game_data["ball"]["vel"]["x"] = -game_data["ball"]["vel"]["x"]
    
    game_data["ball"]["x"] += game_data["ball"]["vel"]["x"]
    game_data["ball"]["y"] += game_data["ball"]["vel"]["y"]