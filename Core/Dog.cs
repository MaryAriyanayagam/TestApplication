using System;
using System.Xml.Linq;

namespace TestApplication
{
    public class Dog : IAnimal
    {
        ConsoleColor _color;
        ConsoleColor _defaultColor;

        public Dog()
        {
            _defaultColor = System.Console.ForegroundColor;
            _color = System.ConsoleColor.Red;
        }

        public void Play()
        {
            System.Console.ForegroundColor = _color;
            System.Console.WriteLine("Dog is chasing its tail...");
            System.Console.ForegroundColor = _defaultColor;

        }

        public void Speak() => Bark();

        private void Bark()
        {
            System.Console.ForegroundColor = _color;
            System.Console.WriteLine("Bark!");
            System.Console.ForegroundColor = _defaultColor;
        }
    }

    //class Dog
    //{
    //    public Dog()
    //    {

    //    }

    //    public void Bark()
    //    {
    //        var c = System.Console.ForegroundColor;
    //        System.Console.ForegroundColor = System.ConsoleColor.Red;
    //        System.Console.WriteLine("Bark!");
    //        System.Console.ForegroundColor = c;
    //    }

    //    public void Play()
    //    {
    //        var c = System.Console.ForegroundColor;
    //        System.Console.ForegroundColor = System.ConsoleColor.Red;
    //        System.Console.WriteLine("Dog is chasing its tail...");
    //        System.Console.ForegroundColor = c;
    //    }
    //}
}
