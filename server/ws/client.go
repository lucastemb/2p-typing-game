package ws

import (
	"encoding/json"
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
	RoomID   string `json:"roomId"`
	Username string `json:"username"`
	Alert    string `json:"alert"`
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
		_, m, err := c.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}

		var payload GameState

		if err := json.Unmarshal(m, &payload); err != nil {
			log.Printf("failed to parse message: %v", err)
			continue
		}
		msg := &Message{
			Content:  &payload,
			RoomID:   c.RoomID,
			Username: c.Username,
			Alert:    "New payload received",
		}

		hub.Broadcast <- msg
	}
}
