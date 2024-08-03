'use client' //Declares a client-side app, since this will be what clients will use. 
import Image from "next/image";
import {useState, useEffect} from 'react'
import {firestore} from '@/firebase'
import {Box, Typography, Modal, Stack, TextField, Button} from '@mui/material'
import {query, collection, getDocs, getDoc, deleteDoc, doc, setDoc} from 'firebase/firestore'

export default function Home() {
  // Creating variables to store the relevant information we need
  const [inventory, setInventory] = useState([]) //declares the inventory variable and sets its default to an empty array
  const [open, setOpen] = useState(false) //declares the open variable(wether the inventory is open or not) sets its default to the false boolean 
  const [itemName, setItemName] = useState('') //declares the itemName variable and sets its default to an empty string

  //Functions 

  //A function that fetches the inventory from the firebase firestore database.
  const updateInventory = async() => { //async means that it won't block the code while fetching, therefore not freezing the site.(maybe the other way around)
    const snapshot = query(collection(firestore, 'inventory')) //gets the snapshot of the collection from the database
    const docs = await getDocs(snapshot) //gets a snapshot of the document from the snapshot of the collection
    const inventoryList = [] //declares the inventoryList variable and defaults it to an empty array. This will contain the ENTIRE inventory.
    
    //going through each document, push an object, containing the name of the document and the data within it, into the inventoryList array
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data()
      })
    })
    setInventory(inventoryList)// Sets the updated inventory as the final inventoryList once all docs have been parsed through
    //console.log(inventoryList)
  }

  //A function that removes an item from the inventory and database
  const removeItem = async(item) =>{
    const docRef = doc(collection(firestore, 'inventory'), item) //finds the item being substracted from
    const docSnap = await getDoc(docRef) //gets a snapshot of the item

    if(docSnap.exists()){
      const {quantity} = docSnap.data() //gets the quantity of the item
      if (quantity === 1){
        await deleteDoc(docRef) //deletes the document
      }
      else{
        await setDoc(docRef, {quantity: quantity - 1}) //substracts 1 from the quantity of the item
      }
    }
    //Could potentially make an error message if it doesn't exist

    await updateInventory()
  }

  //A function that adds an item from the inventory and database
  const addItem = async(item) =>{
    const docRef = doc(collection(firestore, 'inventory'), item) //finds the item being added to
    const docSnap = await getDoc(docRef) //gets a snapshot of the item

    if(docSnap.exists()){
      const {quantity} = docSnap.data() //gets the quantity of the item
      await setDoc(docRef, {quantity: quantity + 1}) //adds 1 to the quantity of the item
      }
    else{
      await setDoc(docRef, {quantity: 1}) 
    }
    await updateInventory()
  }

  //useEffect runs the code before the comma(in this case updateInventory) whenever something in its dependency array(after the comma and currently empty) changes. 
  useEffect(() =>{
    updateInventory()
    },
    []//since theres nothing in the dependency array, this useEffect just runs once when the page loads
  )
  
  //Modal Functions
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  return (
    <Box 
    width='100vw' //to cover the full width
    height='100vh' //to cover the full height
    display='flex' //not sure
    flexDirection='column'
    justifyContent='center' //centers horizontally
    alignItems='center' //centers vertically
    gap={2} //probably the gap from the edges?
    >
      <Modal open={open} onClose={handleClose}>
        <Box 
        position='absolute' //centers the box
        top='50%'
        left='50%'
        width={400}
        bgcolor='white'
        border='2px solid #0000'
        boxShadow={24}
        p={4}
        display='flex'
        flexDirection='column'
        gap={3}
        sx={{
          transform: 'translate(-50%,-50%)',
        }}
        >
          <Typography variant='h6'>Add Item</Typography>
          <Stack width='100%' direction='row' spacing={2}>
            <TextField 
            variant='outlined'
            fullWidth 
            value={itemName}
            onChange={(e) => {
              setItemName(e.target.value
              )
            }}
            />
            <Button variant='outlined' onClick={()=>{
              addItem(itemName)
              setItemName('')
              handleClose()
            }}
            >Add</Button>
          </Stack>

        </Box>
      </Modal>
      <Button variant = 'contained' onClick={()=>{
        handleOpen()
        }}
      >
        Add New Item
      </Button>
      <Box border='1px solid #333'>
          <Box width= '800px' height= '100px' bgcolor='#ADD8E6' display='flex' alignItems='center' justifyContent='center'>
            <Typography variant= 'h2' color= '#333'>
              Inventory Items
            </Typography>
          </Box>
        
        <Stack width='800px' height='300px' spacing={2} overflow='auto'>
          {
            inventory.map(({name, quantity})=>(
              <Box 
                key={name} 
                width='100%' 
                minHeight='150px' 
                display='flex' 
                alignItems='center' 
                justifyContent='space-between' 
                bgColor='#f0f0f0' 
                padding={5}
              >
                <Typography variant='h3' color='#333' textAlign='center'>
                  {name}
                </Typography>
                <Typography variant='h3' color='#333' textAlign='center'>
                  {quantity}
                </Typography>
                <Stack direction='row' spacing={2}>
                  <Button variant='contained' onClick={()=>{
                    addItem(name)
                    }}
                  > 
                    Add
                  </Button>
                  <Button variant='contained' onClick={()=>{
                    removeItem(name)
                    }}
                  > 
                    Remove
                  </Button>
                </Stack>
              </Box>
            ))
          }
        </Stack>
      </Box>
    </Box>
  )
}
