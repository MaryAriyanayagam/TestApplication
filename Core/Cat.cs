using System;

namespace TestApplication
{
    public class Cat : IAnimal
    {
        ConsoleColor _color;
        ConsoleColor _defaultColor;
        public Cat()
        {
            _defaultColor = System.Console.ForegroundColor; 
            _color = System.ConsoleColor.Green;
        }

        public void Speak() {
            Meow();
          
        }
        public void Play()
        {
            System.Console.ForegroundColor = _color;
            System.Console.WriteLine("Cat is chasing its shadow...");
            System.Console.ForegroundColor = _defaultColor;
        }

        private void Meow()
        {
            System.Console.ForegroundColor = _color;
            System.Console.WriteLine("Meow!");
            System.Console.ForegroundColor = _defaultColor;
        }
    }

    //class Cat
    //{
    //    public Cat()
    //    {

    //    }

    //    public void Meow()
    //    {
    //        var c = System.Console.ForegroundColor;
    //        System.Console.ForegroundColor = System.ConsoleColor.Green;
    //        System.Console.WriteLine("Meow!");
    //        System.Console.ForegroundColor = c;
    //    }

    //    public void Play()
    //    {
    //        var c = System.Console.ForegroundColor;
    //        System.Console.ForegroundColor = System.ConsoleColor.Green;
    //        System.Console.WriteLine("Cat is chasing its shadow...");
    //        System.Console.ForegroundColor = c;
    //    }
    //}
}
