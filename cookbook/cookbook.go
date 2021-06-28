// Cookbook implementation
// Cale Overstreet
// Jun 27, 2021

/* Handles recipe database and JMOD routing
 */

package cookbook

import (
	_ "embed"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"sync"

	"github.com/ccoverstreet/Jarmuz-Cookbook/jablkodev"
)

const defaultConfig = `
{
	"instances": {
		"inst0": {
			"title": "Cookbook"
		}
	}
}
`

type Instance struct {
	Title string `json:"title"`
}

type Recipe struct {
	Ingredients  string
	Instructions string
}

type Cookbook struct {
	sync.RWMutex
	Instances      map[string]Instance `json:"instances"`
	jablkoCorePort string
	jmodPort       string
	jmodKey        string
	jmodDataDir    string

	mux *http.ServeMux

	recipes map[string]Recipe
}

func CreateCookbook(jablkoCorePort, jmodPort, jmodKey, jmodDataDir, jmodConfig string) *Cookbook {
	book := &Cookbook{
		sync.RWMutex{},
		make(map[string]Instance),
		jablkoCorePort,
		jmodPort,
		jmodKey,
		jmodDataDir,
		http.NewServeMux(),
		make(map[string]Recipe),
	}

	fShouldSave := len(jmodConfig) < 4

	if fShouldSave {
		jmodConfig = defaultConfig
	}

	log.Println(jmodConfig)

	err := json.Unmarshal([]byte(jmodConfig), &book)
	if err != nil {
		panic(err)
	}

	if fShouldSave {
		book.SaveConfig()
	}

	// Try to read recipe database if it exists
	b, err := ioutil.ReadFile(jmodDataDir + "/jarmuzrecipes.json")
	if err != nil {
		if !os.IsNotExist(err) {
			log.Println(err)
			panic(err)
		}

		b = []byte("{}")
	}
	log.Println(string(b))

	err = json.Unmarshal(b, &book.recipes)
	if err != nil {
		log.Println(err)
		panic(err)
	}

	// Routes
	book.mux.HandleFunc("/webComponent", book.WebComponentHandler)
	book.mux.HandleFunc("/instanceData", book.InstanceHandler)

	book.mux.HandleFunc("/jmod/getRecipeList", book.GetRecipeListHandler)
	book.mux.HandleFunc("/jmod/addRecipe", book.AddRecipeHandler)

	return book
}

func (book *Cookbook) GetRouter() *http.ServeMux {
	return book.mux
}

func (book *Cookbook) SaveConfig() error {
	b, err := json.Marshal(book)
	if err != nil {
		return err
	}

	log.Println(string(b))

	err = jablkodev.JablkoSaveConfig(book.jablkoCorePort,
		book.jmodPort,
		book.jmodKey,
		b)

	return nil
}

func (book *Cookbook) SaveRecipeDatabase() error {
	b, err := json.Marshal(book.recipes)
	if err != nil {
		return err
	}

	err = ioutil.WriteFile(book.jmodDataDir+"/jarmuzrecipes.json", b, 0666)
	if err != nil {
		return err
	}

	return nil
}

func (book *Cookbook) GetRecipeNames() []string {
	book.RLock()
	defer book.RUnlock()
	names := []string{}
	for name, _ := range book.recipes {
		names = append(names, name)
	}

	return names
}

func (book *Cookbook) AddRecipe(name string, ingredients string, instructions string) error {
	book.Lock()
	defer book.Unlock()

	// Check if recipe already exists
	if _, ok := book.recipes[name]; ok {
		return fmt.Errorf("Recipe already exists")
	}

	book.recipes[name] = Recipe{ingredients, instructions}

	return book.SaveRecipeDatabase()
}
