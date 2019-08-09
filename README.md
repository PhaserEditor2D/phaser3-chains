# Phaser Chains

Phaser Chains is a tool to browse the Phaser API and examples. It is not the common navigator that presents the data as a tree of elements.

For each Phaser API element we create a line of code (chain) with a particular format, so you will perform a search on all these lines and use the format to extract the information you are looking for.

Let's see an example:

You know the Phaser API allows to write lot of "chaining code", and you can add objects to a scene in this way: `this.add.sprite(...)`. That's ok, but know you want to know all the kind of objects you can add to the scene in the same way, so you write the query:

```
this.add (
```

And the result is:


![Search chains to add objects](guide-images/search-1.png)


If you scroll down a bit, you will see a lot of lines extracted from the official Phaser examples:

![Search chains to add objects in examples](guide-images/search-2.png).

This means, your query is used to search on the Phaser API and the Phaser examples at the same time. Phaser provides a lot of examples and every major feature is showcase in one or more of them. 
