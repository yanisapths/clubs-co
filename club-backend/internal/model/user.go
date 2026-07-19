package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID           uuid.UUID      `gorm:"type:uuid;primaryKey"              json:"id"`
	Email        string         `gorm:"uniqueIndex;not null;size:255"     json:"email"`
	Username     string         `gorm:"uniqueIndex;not null;size:100"     json:"username"`
	PasswordHash string         `gorm:"not null"                          json:"-"`
	DisplayName    string         `gorm:"size:50"                          json:"display_name"`
	IsActive     bool           `gorm:"default:true"                      json:"is_active"`
	
	GoogleID     *string        `gorm:"uniqueIndex;size:255"              json:"-"`
	CreatedAt    time.Time      `                                         json:"created_at"`
	UpdatedAt    time.Time      `                                         json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index"                             json:"-"`
}
 
func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return nil
}
 