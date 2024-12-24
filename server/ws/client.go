package ws

import (
	"github.com/gorilla/websocket"
	"log"
)

type GameState struct {
	Lives  int `json:"lives"`
	Scene  int `json:"scene"`
	Streak int `json:"streak"`
}

type Message struct {
	Content  *GameState
	RoomID   int    `json:"roomId"`
	Username string `json:"username"`
}

type Client struct {
	Conn     *websocket.Conn
	RoomID   string `json:"roomId"`
	Username string `json:"user"`
	Message  chan *Message
	ID       string `json:"id"`
}

func (c *Client) writeMessage() {
	defer func() {
		c.Conn.Close()
	}()

	for {
		message, ok := <-c.Message
		if !ok {
			return
		}
		c.Conn.WriteJSON(message)
	}
}

func (c *Client) readMessage(hub *Hub) {
	defer func() {
		hub.Unregister <- c
		c.Conn.Close()
	}()

	for {
		_, _, err := c.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}

		// msg := &Message{
		// 	Content:  string(m),
		// 	RoomID:   c.RoomID,
		// 	Username: c.Username,
		// }

		// hub.Broadcast <- msg
	}
}
